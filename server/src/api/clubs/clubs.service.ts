import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ClubStatus,
  RegistrationRole,
  RegistrationStatus,
} from '../../../generated/prisma/enums';
import { mapRegistrationStatus } from '../../shared/util/registration-status.util';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateClubDto } from './clubs.schemas';

type ClubRow = Awaited<ReturnType<ClubsService['findRaw']>>[number];

const CLUB_DURATION_MS = 2 * 60 * 60 * 1000;

@Injectable()
export class ClubsService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId?: string) {
    const rows = await this.findRaw();
    return rows.map((r) => this.format(r, userId));
  }

  async getOne(id: string, userId?: string) {
    const [row] = await this.findRaw(id);
    if (!row) throw new NotFoundException('Club not found');
    return this.format(row, userId);
  }

  async create(userId: string, data: CreateClubDto) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(startDate.getTime() + CLUB_DURATION_MS);
    const club = await this.prisma.club.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        startDate,
        endDate,
        maxMembers: data.maxMembers,
        hostId: userId,
      },
      include: {
        host: { select: { id: true, name: true, avatarUrl: true } },
        registrations: true,
      },
    });
    return this.format(club, userId);
  }

  async remove(clubId: string, userId: string) {
    await this.assertHost(clubId, userId);
    await this.prisma.club.delete({ where: { id: clubId } });
  }

  async apply(clubId: string, userId: string) {
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');

    const existing = await this.prisma.registration.findUnique({
      where: { userId_clubId: { userId, clubId } },
    });
    if (existing) return existing;

    if (club.status === ClubStatus.CANCELLED) {
      throw new ConflictException('Club is cancelled');
    }
    if (club.startDate <= new Date()) {
      throw new ConflictException('Club has already started');
    }
    const approved = await this.countApproved(this.prisma, clubId);
    if (approved >= club.maxMembers) {
      throw new ConflictException('Club is full');
    }

    // upsert keeps a concurrent double-apply idempotent instead of a 409.
    return this.prisma.registration.upsert({
      where: { userId_clubId: { userId, clubId } },
      update: {},
      create: {
        userId,
        clubId,
        role: RegistrationRole.LISTENER,
        status: RegistrationStatus.PENDING,
      },
    });
  }

  async getApplicants(clubId: string, hostId: string) {
    await this.assertHost(clubId, hostId);

    const applicants = await this.prisma.registration.findMany({
      where: { clubId, status: RegistrationStatus.PENDING },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    return applicants.map((a) => ({
      ...a,
      status: mapRegistrationStatus(a.status),
    }));
  }

  acceptApplicant(clubId: string, applicantId: string, hostId: string) {
    return this.decide(
      clubId,
      applicantId,
      hostId,
      RegistrationStatus.APPROVED,
    );
  }

  rejectApplicant(clubId: string, applicantId: string, hostId: string) {
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
    target: 'APPROVED' | 'REJECTED',
  ) {
    await this.assertHost(clubId, hostId);

    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Club" WHERE id = ${clubId} FOR UPDATE`;

      const registration = await tx.registration.findUnique({
        where: { userId_clubId: { userId: applicantId, clubId } },
      });
      if (!registration) throw new NotFoundException('Applicant not found');
      if (registration.status === target) return registration;
      if (registration.status !== RegistrationStatus.PENDING) {
        throw new ConflictException('Application is no longer pending');
      }

      if (target === RegistrationStatus.APPROVED) {
        const club = await tx.club.findUniqueOrThrow({
          where: { id: clubId },
        });
        if ((await this.countApproved(tx, clubId)) >= club.maxMembers) {
          throw new ConflictException('Club is full');
        }
      }

      return tx.registration.update({
        where: { id: registration.id },
        data: { status: target },
      });
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

  private async assertHost(clubId: string, userId: string) {
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');
    if (club.hostId !== userId) throw new ForbiddenException();
    return club;
  }

  private findRaw(id?: string) {
    const where = id ? { id } : {};
    return this.prisma.club.findMany({
      where,
      include: {
        host: { select: { id: true, name: true, avatarUrl: true } },
        registrations: {
          where: {
            status: {
              in: [RegistrationStatus.APPROVED, RegistrationStatus.PENDING],
            },
          },
          select: { userId: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private format(club: ClubRow, userId?: string) {
    const currentMemberCount = club.registrations.filter(
      (r) => r.status === RegistrationStatus.APPROVED,
    ).length;
    const isFull = currentMemberCount >= club.maxMembers;
    const rawStatus = club.status.toLowerCase() as
      'active' | 'cancelled' | 'full';
    const status = isFull && rawStatus === 'active' ? 'full' : rawStatus;

    return {
      id: club.id,
      name: club.name,
      description: club.description,
      location: club.location,
      maxMembers: club.maxMembers,
      currentMemberCount,
      status,
      startDate: club.startDate.toISOString(),
      endDate: (club.endDate ?? club.startDate).toISOString(),
      createdAt: club.createdAt.toISOString(),
      host: {
        id: club.host.id,
        name: club.host.name,
        ...(club.host.avatarUrl ? { avatarUrl: club.host.avatarUrl } : {}),
      },
      isRegistered: userId
        ? club.registrations.some((r) => r.userId === userId)
        : false,
    };
  }
}
