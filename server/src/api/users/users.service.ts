import { Injectable } from '@nestjs/common';
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
    const { password: _pw, ...pub } = user;
    void _pw;
    return {
      ...pub,
      dateOfBirth: pub.dateOfBirth.toISOString().split('T')[0],
      createdAt: pub.createdAt.toISOString(),
    };
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

  getMyHostedClub(userId: string) {
    return this.prisma.club.findFirst({
      where: { hostId: userId },
      select: { id: true },
    });
  }
}
