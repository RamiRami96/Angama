import { Injectable } from '@nestjs/common';
import { toPublicUser } from '../../shared/mapper/user.mapper';
import { mapRegistrationStatus } from '../../shared/util/registration-status.util';
import { PrismaService } from '../../prisma/prisma.service';
import type { UpdateProfileDto } from '../../contracts';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return toPublicUser(user);
  }

  async getMyApplications(userId: string) {
    const regs = await this.prisma.registration.findMany({
      where: { userId },
      include: {
        club: {
          select: { id: true, name: true, startDate: true, location: true },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });

    return regs.map((r) => ({
      userId,
      clubId: r.clubId,
      clubName: r.club.name,
      status: mapRegistrationStatus(r.status),
      registeredAt: r.registeredAt.toISOString(),
      club: {
        id: r.club.id,
        name: r.club.name,
        startDate: r.club.startDate.toISOString(),
        location: r.club.location,
      },
    }));
  }
}
