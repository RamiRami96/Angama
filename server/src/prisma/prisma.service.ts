import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService<Env, true>) {
    // DIRECT_URL (non-pooled) is deliberately preferred at runtime when set;
    // DATABASE_URL is the fallback and is what prisma.config.ts uses for the CLI.
    super({
      datasources: {
        db: {
          url:
            config.get('DIRECT_URL', { infer: true }) ??
            config.get('DATABASE_URL', { infer: true }),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
