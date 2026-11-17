import { BadRequestException, Injectable } from '@nestjs/common';
import { toPublicUser } from '../../shared/mapper/user.mapper';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  LanguageLevel,
  UpdateLanguagesDto,
  UpdatePreferencesDto,
  UpdateProfileDto,
} from '../../contracts';

export interface UserPreferences {
  goals: string[];
  interests: string[];
  languages: { code: string; level: LanguageLevel }[];
}

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
}
