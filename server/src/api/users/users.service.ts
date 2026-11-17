import { BadRequestException, Injectable } from '@nestjs/common';
import { toPublicUser } from '../../shared/mapper/user.mapper';
import { PrismaService } from '../../prisma/prisma.service';
import { ParticipationStatus } from '../../../generated/prisma/enums';
import {
  CONFIRMED_STATUSES,
  EVENT_INCLUDE,
  toEventDto,
  type EventDto,
} from '../events/events.mapper';
import { EventsService } from '../events/events.service';
import type {
  LanguageLevel,
  MyEventsQuery,
  UpdateLanguagesDto,
  UpdatePreferencesDto,
  UpdateProfileDto,
} from '../../contracts';

export interface OrganizedEventItem {
  event: EventDto;
  participantCount: number;
  pendingCount: number;
}

export interface JoinedEventItem {
  event: EventDto;
  participationStatus: ParticipationStatus;
}

export interface UserPreferences {
  goals: string[];
  interests: string[];
  languages: { code: string; level: LanguageLevel }[];
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
  ) {}

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return toPublicUser(user);
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    const [prefs, langs] = await Promise.all([
      this.prisma.userPreference.findMany({
        where: { userId },
        include: { preference: true },
        orderBy: { preference: { code: 'asc' } },
      }),
      this.prisma.userLanguage.findMany({
        where: { userId },
        include: { language: true },
        orderBy: { language: { name: 'asc' } },
      }),
    ]);

    return {
      goals: prefs
        .filter((p) => p.preference.type === 'GOAL')
        .map((p) => p.preference.code),
      interests: prefs
        .filter((p) => p.preference.type === 'INTEREST')
        .map((p) => p.preference.code),
      languages: langs.map((l) => ({
        code: l.language.code,
        level: l.level,
      })),
    };
  }

  async setPreferences(userId: string, dto: UpdatePreferencesDto) {
    const found = await this.prisma.preference.findMany({
      where: {
        OR: [
          { type: 'GOAL', code: { in: dto.goals } },
          { type: 'INTEREST', code: { in: dto.interests } },
        ],
      },
    });
    if (found.length !== dto.goals.length + dto.interests.length) {
      throw new BadRequestException('Unknown goal or interest code');
    }

    await this.prisma.$transaction([
      this.prisma.userPreference.deleteMany({ where: { userId } }),
      this.prisma.userPreference.createMany({
        data: found.map((p) => ({ userId, preferenceId: p.id })),
      }),
    ]);

    return this.getPreferences(userId);
  }

  async setLanguages(userId: string, dto: UpdateLanguagesDto) {
    const items = dto.languages.map((l) => ({
      code: l.code.toLowerCase(),
      level: l.level,
    }));
    const codes = items.map((l) => l.code);
    if (new Set(codes).size !== codes.length) {
      throw new BadRequestException('Duplicate language codes');
    }

    const found = await this.prisma.language.findMany({
      where: { code: { in: codes } },
    });
    const idByCode = new Map(found.map((l) => [l.code, l.id]));
    if (found.length !== codes.length) {
      throw new BadRequestException('Unknown language code');
    }

    await this.prisma.$transaction([
      this.prisma.userLanguage.deleteMany({ where: { userId } }),
      this.prisma.userLanguage.createMany({
        data: items.map((l) => ({
          userId,
          languageId: idByCode.get(l.code) as string,
          level: l.level,
        })),
      }),
    ]);

    return this.getPreferences(userId);
  }

  async getMyEvents(
    userId: string,
    role: 'organizer',
  ): Promise<OrganizedEventItem[]>;
  async getMyEvents(
    userId: string,
    role: 'participant',
  ): Promise<JoinedEventItem[]>;
  async getMyEvents(
    userId: string,
    role: MyEventsQuery['role'],
  ): Promise<OrganizedEventItem[] | JoinedEventItem[]>;
  async getMyEvents(
    userId: string,
    role: MyEventsQuery['role'],
  ): Promise<OrganizedEventItem[] | JoinedEventItem[]> {
    await this.events.completeFinished();
    return role === 'organizer'
      ? this.getOrganizedEvents(userId)
      : this.getJoinedEvents(userId);
  }

  private async getOrganizedEvents(
    userId: string,
  ): Promise<OrganizedEventItem[]> {
    const rows = await this.prisma.event.findMany({
      where: { organizerId: userId },
      include: EVENT_INCLUDE,
      orderBy: { startsAt: 'desc' },
    });
    if (!rows.length) return [];

    const groups = await this.prisma.eventParticipant.groupBy({
      by: ['eventId', 'status'],
      where: { eventId: { in: rows.map((r) => r.id) } },
      _count: true,
    });
    const confirmed = new Map<string, number>();
    const pending = new Map<string, number>();
    for (const g of groups) {
      if (CONFIRMED_STATUSES.includes(g.status)) {
        confirmed.set(g.eventId, (confirmed.get(g.eventId) ?? 0) + g._count);
      } else if (g.status === ParticipationStatus.REQUESTED) {
        pending.set(g.eventId, g._count);
      }
    }

    return rows.map((r) => ({
      event: toEventDto(r, userId),
      participantCount: confirmed.get(r.id) ?? 0,
      pendingCount: pending.get(r.id) ?? 0,
    }));
  }

  private async getJoinedEvents(userId: string): Promise<JoinedEventItem[]> {
    const rows = await this.prisma.eventParticipant.findMany({
      where: { userId },
      include: { event: { include: EVENT_INCLUDE } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      event: toEventDto(r.event, userId, r.status),
      participationStatus: r.status,
    }));
  }
}
