import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OptionalAuth } from '../auth/decorators/auth-mode.decorator';

@Controller('catalog')
export class CatalogController {
  constructor(private prisma: PrismaService) {}

  @OptionalAuth()
  @Get()
  async getCatalog() {
    const [preferences, languages, categories] = await Promise.all([
      this.prisma.preference.findMany({
        select: { type: true, code: true, label: true },
        orderBy: { label: 'asc' },
      }),
      this.prisma.language.findMany({
        select: { code: true, name: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.eventCategory.findMany({
        select: { code: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    const pick = (type: 'GOAL' | 'INTEREST') =>
      preferences
        .filter((p) => p.type === type)
        .map(({ code, label }) => ({ code, label }));

    return {
      goals: pick('GOAL'),
      interests: pick('INTEREST'),
      languages,
      categories,
    };
  }
}
