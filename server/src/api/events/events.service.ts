import {
  BadRequestException,
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
import type {
  CreateEventDto,
  EventCategoryCode,
  ListEventsQuery,
  UpdateEventDto,
} from '../../contracts';
import { PrismaService } from '../../prisma/prisma.service';
import { parseEventDetails } from './event-details';
import {
  CONFIRMED_STATUSES,
  EVENT_INCLUDE,
  toEventDto,
  type EventDto,
  type EventWithRelations,
} from './events.mapper';

/** Hard cap until the client grows paging. */
const MAX_LIST_SIZE = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Event statuses the organizer may still edit or cancel. */
const OPEN_STATUSES: EventStatus[] = [EventStatus.DRAFT, EventStatus.PUBLISHED];

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async list(
    viewerId: string | undefined,
    q: ListEventsQuery,
  ): Promise<EventDto[]> {
    await this.completeFinished();

    const where: Prisma.EventWhereInput = { status: EventStatus.PUBLISHED };
    if (q.q) where.name = { contains: q.q, mode: 'insensitive' };
    if (q.category) where.category = { code: q.category };
    if (q.language) where.language = { code: q.language.toLowerCase() };
    if (q.city) where.city = { equals: q.city, mode: 'insensitive' };
    if (q.date) {
      const dayStart = new Date(`${q.date}T00:00:00.000Z`);
      where.startsAt = {
        gte: dayStart,
        lt: new Date(dayStart.getTime() + DAY_MS),
      };
    }

    const rows = await this.prisma.event.findMany({
      where,
      include: EVENT_INCLUDE,
      orderBy: { startsAt: 'asc' },
      take: MAX_LIST_SIZE,
    });
    return this.toDtos(rows, viewerId);
  }

  async getOne(id: string, viewerId?: string): Promise<EventDto> {
    const row = await this.prisma.event.findUnique({
      where: { id },
      include: EVENT_INCLUDE,
    });
    if (
      !row ||
      (row.status === EventStatus.DRAFT && row.organizerId !== viewerId)
    ) {
      throw new NotFoundException('Event not found');
    }
    const [dto] = await this.toDtos([row], viewerId);
    return dto;
  }

  async create(organizerId: string, dto: CreateEventDto): Promise<EventDto> {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    if (startsAt.getTime() <= Date.now()) {
      throw new BadRequestException('Start must be in the future');
    }
    if (endsAt <= startsAt) {
      throw new BadRequestException('End must be after start');
    }

    const category = await this.prisma.eventCategory.findUnique({
      where: { code: dto.category },
    });
    if (!category) throw new BadRequestException('Unknown event category');
    const languageId = await this.resolveLanguageId(dto.language);
    const details = parseEventDetails(dto.category, dto.details);

    const row = await this.prisma.event.create({
      data: {
        name: dto.name,
        description: dto.description,
        details: details as Prisma.InputJsonObject,
        coverImageUrl: dto.coverImageUrl ?? null,
        startsAt,
        endsAt,
        city: dto.city,
        address: dto.address,
        maxParticipants: dto.maxParticipants,
        price: dto.price ?? null,
        status: dto.status,
        categoryId: category.id,
        languageId,
        organizerId,
      },
      include: EVENT_INCLUDE,
    });
    return toEventDto(row, organizerId);
  }

  /**
   * Runs under the event row lock (same lock as participation changes), so a
   * concurrent approval cannot push the confirmed count above a lowered
   * `maxParticipants`, and an edit cannot land after a committed cancel.
   */
  async update(
    id: string,
    organizerId: string,
    dto: UpdateEventDto,
  ): Promise<EventDto> {
    await this.assertOrganizer(id, organizerId);

    return this.prisma.$transaction(async (tx) => {
      const event = await this.lockEvent(tx, id);
      if (!OPEN_STATUSES.includes(event.status)) {
        throw new ConflictException('Event can no longer be edited');
      }
      if (dto.status !== undefined && dto.status !== event.status) {
        throw new ConflictException(
          'Use the publish or cancel endpoints to change the status',
        );
      }

      if (dto.maxParticipants !== undefined) {
        const confirmed = await tx.eventParticipant.count({
          where: { eventId: id, status: { in: CONFIRMED_STATUSES } },
        });
        if (dto.maxParticipants < confirmed) {
          throw new ConflictException(
            `Max participants cannot be below the ${confirmed} confirmed participants`,
          );
        }
      }

      const startsAt = dto.startsAt ? new Date(dto.startsAt) : event.startsAt;
      const endsAt = dto.endsAt ? new Date(dto.endsAt) : event.endsAt;
      if (endsAt <= startsAt) {
        throw new BadRequestException('End must be after start');
      }

      const data: Prisma.EventUncheckedUpdateInput = {};
      if (dto.name !== undefined) data.name = dto.name;
      if (dto.description !== undefined) data.description = dto.description;
      if (dto.coverImageUrl !== undefined) {
        data.coverImageUrl = dto.coverImageUrl;
      }
      if (dto.startsAt !== undefined) data.startsAt = startsAt;
      if (dto.endsAt !== undefined) data.endsAt = endsAt;
      if (dto.city !== undefined) data.city = dto.city;
      if (dto.address !== undefined) data.address = dto.address;
      if (dto.maxParticipants !== undefined) {
        data.maxParticipants = dto.maxParticipants;
      }
      if (dto.price !== undefined) data.price = dto.price;
      if (dto.details !== undefined) {
        data.details = parseEventDetails(
          event.category.code as EventCategoryCode,
          { ...(event.details as Record<string, unknown>), ...dto.details },
        ) as Prisma.InputJsonObject;
      }
      if (dto.language !== undefined) {
        data.languageId = await this.resolveLanguageId(dto.language, tx);
      }

      const row = await tx.event.update({
        where: { id },
        data,
        include: EVENT_INCLUDE,
      });
      return toEventDto(row, organizerId);
    });
  }

  /** Locked like `cancel`, so a concurrent cancel is never overwritten. */
  async publish(id: string, organizerId: string): Promise<EventDto> {
    await this.assertOrganizer(id, organizerId);

    return this.prisma.$transaction(async (tx) => {
      const event = await this.lockEvent(tx, id);
      if (event.status !== EventStatus.DRAFT) {
        throw new ConflictException('Only a draft can be published');
      }
      if (event.startsAt.getTime() <= Date.now()) {
        throw new BadRequestException('Start must be in the future');
      }
      const row = await tx.event.update({
        where: { id },
        data: { status: EventStatus.PUBLISHED },
        include: EVENT_INCLUDE,
      });
      return toEventDto(row, organizerId);
    });
  }

  /**
   * Cancels under a row lock so concurrent cancels (or participation changes)
   * serialize: the second cancel sees CANCELLED and sends no notifications.
   */
  async cancel(id: string, organizerId: string): Promise<EventDto> {
    await this.assertOrganizer(id, organizerId);

    return this.prisma.$transaction(async (tx) => {
      const event = await this.lockEvent(tx, id);
      if (!OPEN_STATUSES.includes(event.status)) {
        throw new ConflictException('Event can no longer be cancelled');
      }

      const row = await tx.event.update({
        where: { id },
        data: { status: EventStatus.CANCELLED },
        include: EVENT_INCLUDE,
      });

      const toNotify = await tx.eventParticipant.findMany({
        where: {
          eventId: id,
          status: {
            in: [ParticipationStatus.REQUESTED, ParticipationStatus.APPROVED],
          },
        },
        select: { userId: true },
      });
      if (toNotify.length) {
        await tx.notification.createMany({
          data: toNotify.map(({ userId }) => ({
            type: NotificationType.EVENT_CANCELLED,
            eventId: id,
            userId,
            actorId: organizerId,
          })),
        });
      }

      return toEventDto(row, organizerId);
    });
  }

  /** Marks PUBLISHED events that have ended as COMPLETED. */
  async completeFinished(): Promise<void> {
    await this.prisma.event.updateMany({
      where: { status: EventStatus.PUBLISHED, endsAt: { lt: new Date() } },
      data: { status: EventStatus.COMPLETED },
    });
  }

  /** Returns the event when `userId` is its organizer; 404 / 403 otherwise. */
  async assertOrganizer(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== userId) throw new ForbiddenException();
    return event;
  }

  /**
   * Takes the event row lock, then re-reads the event under it. Every write
   * that depends on capacity or event status (edits, cancel, participation)
   * goes through this lock so they serialize.
   */
  async lockEvent(tx: Prisma.TransactionClient, id: string) {
    await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${id} FOR UPDATE`;
    return tx.event.findUniqueOrThrow({
      where: { id },
      include: { category: true },
    });
  }

  private async resolveLanguageId(
    code: string,
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<string> {
    const language = await client.language.findUnique({
      where: { code: code.toLowerCase() },
    });
    if (!language) throw new BadRequestException(`Unknown language: ${code}`);
    return language.id;
  }

  /**
   * Maps rows for `viewerId`. A viewer whose participation is CANCELLED or
   * REJECTED is not in the included rows, so it is looked up in one query.
   */
  private async toDtos(
    rows: EventWithRelations[],
    viewerId?: string,
  ): Promise<EventDto[]> {
    const missing = viewerId
      ? rows
          .filter((r) => !r.participants.some((p) => p.userId === viewerId))
          .map((r) => r.id)
      : [];

    const statusByEvent = new Map<string, ParticipationStatus>();
    if (viewerId && missing.length) {
      const extra = await this.prisma.eventParticipant.findMany({
        where: { eventId: { in: missing }, userId: viewerId },
        select: { eventId: true, status: true },
      });
      for (const p of extra) statusByEvent.set(p.eventId, p.status);
    }

    return rows.map((r) =>
      toEventDto(r, viewerId, statusByEvent.get(r.id) ?? null),
    );
  }
}
