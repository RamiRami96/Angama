import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ClubStatus,
  RegistrationRole,
  RegistrationStatus,
} from '../../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { mapRegistrationStatus } from '../../shared/util/registration-status.util';
import { ClubsService } from './clubs.service';
import { toRegistrationDto } from './registrations.mapper';

type Decision = 'APPROVED' | 'REJECTED';

/** Joining a club and the host's decisions on applicants. */
@Injectable()
export class RegistrationsService {
  constructor(
    private prisma: PrismaService,
    private clubs: ClubsService,
  ) {}

  async apply(clubId: string, userId: string) {
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');

    const existing = await this.prisma.registration.findUnique({
      where: { userId_clubId: { userId, clubId } },
    });
    if (existing) return toRegistrationDto(existing);

    if (club.status === ClubStatus.CANCELLED) {
      throw new ConflictException('Club is cancelled');
    }
    if (club.startDate <= new Date()) {
      throw new ConflictException('Club has already started');
    }
    if ((await this.countApproved(this.prisma, clubId)) >= club.maxMembers) {
      throw new ConflictException('Club is full');
    }

    // upsert keeps a concurrent double-apply idempotent instead of a 409.
    const registration = await this.prisma.registration.upsert({
      where: { userId_clubId: { userId, clubId } },
      update: {},
      create: {
        userId,
        clubId,
        role: RegistrationRole.LISTENER,
        status: RegistrationStatus.PENDING,
      },
    });
    return toRegistrationDto(registration);
  }

  async getApplicants(clubId: string, hostId: string) {
    await this.clubs.assertHost(clubId, hostId);

    const applicants = await this.prisma.registration.findMany({
      where: { clubId, status: RegistrationStatus.PENDING },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    return applicants.map((a) => ({
      userId: a.userId,
      clubId: a.clubId,
      user: a.user,
      status: mapRegistrationStatus(a.status),
    }));
  }

  accept(clubId: string, applicantId: string, hostId: string) {
    return this.decide(
      clubId,
      applicantId,
      hostId,
      RegistrationStatus.APPROVED,
    );
  }

  reject(clubId: string, applicantId: string, hostId: string) {
    return this.decide(
      clubId,
      applicantId,
      hostId,
      RegistrationStatus.REJECTED,
    );
  }

  /**
   * Moves a PENDING registration to `target`. Idempotent when it is already
   * there. The club row is locked so two concurrent approvals cannot both pass
   * the capacity check.
   */
  private async decide(
    clubId: string,
    applicantId: string,
    hostId: string,
    target: Decision,
  ) {
    await this.clubs.assertHost(clubId, hostId);

    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Club" WHERE id = ${clubId} FOR UPDATE`;

      const registration = await tx.registration.findUnique({
        where: { userId_clubId: { userId: applicantId, clubId } },
      });
      if (!registration) throw new NotFoundException('Applicant not found');
      if (registration.status === target)
        return toRegistrationDto(registration);
      if (registration.status !== RegistrationStatus.PENDING) {
        throw new ConflictException('Application is no longer pending');
      }

      if (target === RegistrationStatus.APPROVED) {
        const club = await tx.club.findUniqueOrThrow({ where: { id: clubId } });
        if ((await this.countApproved(tx, clubId)) >= club.maxMembers) {
          throw new ConflictException('Club is full');
        }
      }

      const updated = await tx.registration.update({
        where: { id: registration.id },
        data: { status: target },
      });
      return toRegistrationDto(updated);
    });
  }

  private countApproved(
    db: Pick<PrismaService, 'registration'>,
    clubId: string,
  ) {
    return db.registration.count({
      where: { clubId, status: RegistrationStatus.APPROVED },
    });
  }
}
