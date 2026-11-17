import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import {
  EventStatus,
  NotificationType,
  ParticipationStatus,
} from '../../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { CONFIRMED_STATUSES } from './events.mapper';
import { EventsService } from './events.service';
import {
  PARTICIPANT_INCLUDE,
  toParticipantDto,
  toParticipationDto,
  type ParticipantDto,
  type ParticipationDto,
} from './participations.mapper';

type Decision = 'APPROVED' | 'REJECTED';

const DECISION_NOTIFICATION: Record<Decision, NotificationType> = {
  APPROVED: NotificationType.PARTICIPATION_APPROVED,
  REJECTED: NotificationType.PARTICIPATION_REJECTED,
};

const CANCELLABLE: ParticipationStatus[] = [
  ParticipationStatus.REQUESTED,
  ParticipationStatus.APPROVED,
];

type LockedEvent = { status: EventStatus; startsAt: Date; endsAt: Date };

/**
 * Event completion is lazy (`completeFinished`), so a stored PUBLISHED status
 * may be stale: the times decide too.
 */
function hasEnded(event: LockedEvent, now = Date.now()): boolean {
  return (
    event.status === EventStatus.COMPLETED || event.endsAt.getTime() <= now
  );
}

/**
 * Joining an event and the organizer's decisions on requests. Every state
 * change runs under the event row lock (`EventsService.lockEvent`), so the
 * capacity check and the write are atomic with respect to each other and to
 * event edits / cancellation.
 */
@Injectable()
export class ParticipationsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
  ) {}

  async request(eventId: string, userId: string): Promise<ParticipationDto> {
    const exists = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Event not found');

    // A concurrent duplicate that slips past the lookup below hits the
    // (userId, eventId) unique index; the global filter maps it to a 409.
    return this.prisma.$transaction(async (tx) => {
      const event = await this.events.lockEvent(tx, eventId);
      if (event.organizerId === userId) {
        throw new ForbiddenException('You cannot join your own event');
      }
      if (event.status !== EventStatus.PUBLISHED) {
        throw new ConflictException('Event is not open');
      }
      if (event.startsAt.getTime() <= Date.now()) {
        throw new ConflictException('Event has already started');
      }

      const existing = await tx.eventParticipant.findUnique({
        where: { userId_eventId: { userId, eventId } },
      });
      if (existing) throw new ConflictException('Already requested');

      if ((await this.countConfirmed(tx, eventId)) >= event.maxParticipants) {
        throw new ConflictException('Event is full');
      }

      const created = await tx.eventParticipant.create({
        data: { eventId, userId, status: ParticipationStatus.REQUESTED },
      });
      await tx.notification.create({
        data: {
          type: NotificationType.PARTICIPATION_REQUESTED,
          eventId,
          userId: event.organizerId,
          actorId: userId,
        },
      });
      return toParticipationDto(created);
    });
  }

  approve(eventId: string, userId: string, organizerId: string) {
    return this.decide(
      eventId,
      userId,
      organizerId,
      ParticipationStatus.APPROVED,
    );
  }

  reject(eventId: string, userId: string, organizerId: string) {
    return this.decide(
      eventId,
      userId,
      organizerId,
      ParticipationStatus.REJECTED,
    );
  }

  async cancel(eventId: string, userId: string): Promise<ParticipationDto> {
    return this.prisma.$transaction(async (tx) => {
      // Lock first so the row read below reflects any decision that just
      // committed (no lost update against approve/reject).
      const event = await this.events.lockEvent(tx, eventId);
      const participation = await tx.eventParticipant.findUnique({
        where: { userId_eventId: { userId, eventId } },
      });
      if (!participation)
        throw new NotFoundException('Participation not found');
      if (hasEnded(event)) {
        throw new ConflictException('Event has already ended');
      }
      if (!CANCELLABLE.includes(participation.status)) {
        throw new ConflictException('Participation cannot be cancelled');
      }

      const updated = await tx.eventParticipant.update({
        where: { id: participation.id },
        data: { status: ParticipationStatus.CANCELLED },
      });
      return toParticipationDto(updated);
    });
  }

  async list(
    eventId: string,
    organizerId: string,
    status?: ParticipationStatus,
  ): Promise<ParticipantDto[]> {
    await this.events.assertOrganizer(eventId, organizerId);

    const rows = await this.prisma.eventParticipant.findMany({
      where: {
        eventId,
        status: status ?? { not: ParticipationStatus.CANCELLED },
      },
      include: PARTICIPANT_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toParticipantDto);
  }

  /**
   * Moves a REQUESTED participation to `target`. Idempotent when it is
   * already there. Under the event lock, so two concurrent approvals cannot
   * both pass the capacity check.
   */
  private async decide(
    eventId: string,
    userId: string,
    organizerId: string,
    target: Decision,
  ): Promise<ParticipationDto> {
    await this.events.assertOrganizer(eventId, organizerId);

    return this.prisma.$transaction(async (tx) => {
      const event = await this.events.lockEvent(tx, eventId);

      const participation = await tx.eventParticipant.findUnique({
        where: { userId_eventId: { userId, eventId } },
      });
      if (!participation) throw new NotFoundException('Participant not found');
      if (participation.status === target) {
        return toParticipationDto(participation);
      }
      if (participation.status !== ParticipationStatus.REQUESTED) {
        throw new ConflictException('Request is no longer pending');
      }
      if (event.status !== EventStatus.PUBLISHED || hasEnded(event)) {
        throw new ConflictException('Event is not open');
      }

      if (
        target === ParticipationStatus.APPROVED &&
        (await this.countConfirmed(tx, eventId)) >= event.maxParticipants
      ) {
        throw new ConflictException('Event is full');
      }

      const updated = await tx.eventParticipant.update({
        where: { id: participation.id },
        data: { status: target },
      });
      await tx.notification.create({
        data: {
          type: DECISION_NOTIFICATION[target],
          eventId,
          userId,
          actorId: organizerId,
        },
      });
      return toParticipationDto(updated);
    });
  }

  private countConfirmed(tx: Prisma.TransactionClient, eventId: string) {
    return tx.eventParticipant.count({
      where: { eventId, status: { in: CONFIRMED_STATUSES } },
    });
  }
}
