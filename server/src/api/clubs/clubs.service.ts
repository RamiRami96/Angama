import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClubStatus } from '../../../generated/prisma/enums';
import type { CreateClubDto, ListClubsQuery } from '../../contracts';
import { PrismaService } from '../../prisma/prisma.service';
import { CLUB_INCLUDE, toClubDto } from './clubs.mapper';

const CLUB_DURATION_MS = 2 * 60 * 60 * 1000;
/** Hard cap until the client grows paging. */
const MAX_LIST_SIZE = 100;

@Injectable()
export class ClubsService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId?: string, query: ListClubsQuery = {}) {
    const rows = await this.prisma.club.findMany({
      where: query.upcoming ? { startDate: { gt: new Date() } } : {},
      include: CLUB_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: MAX_LIST_SIZE,
    });
    return rows.map((r) => toClubDto(r, userId));
  }

  async getOne(id: string, userId?: string) {
    const row = await this.prisma.club.findUnique({
      where: { id },
      include: CLUB_INCLUDE,
    });
    if (!row) throw new NotFoundException('Club not found');
    return toClubDto(row, userId);
  }

  async create(userId: string, data: CreateClubDto) {
    // The app models "the club I host" as a single upcoming club.
    const upcoming = await this.prisma.club.findFirst({
      where: {
        hostId: userId,
        status: ClubStatus.ACTIVE,
        startDate: { gt: new Date() },
      },
      select: { id: true },
    });
    if (upcoming) {
      throw new ConflictException('You already host an upcoming club');
    }

    const startDate = new Date(data.startDate);
    const club = await this.prisma.club.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        startDate,
        endDate: new Date(startDate.getTime() + CLUB_DURATION_MS),
        maxMembers: data.maxMembers,
        hostId: userId,
      },
      include: CLUB_INCLUDE,
    });
    return toClubDto(club, userId);
  }

  async remove(clubId: string, userId: string) {
    await this.assertHost(clubId, userId);
    await this.prisma.club.delete({ where: { id: clubId } });
  }

  /** Returns the club when `userId` is its host; 404 / 403 otherwise. */
  async assertHost(clubId: string, userId: string) {
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');
    if (club.hostId !== userId) throw new ForbiddenException();
    return club;
  }
}
