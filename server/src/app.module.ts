import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './api/auth/auth.module';
import { ClubsModule } from './api/clubs/clubs.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './api/users/users.module';
import { parseEnv } from './config/env';
import { AllExceptionsFilter } from './shared/filter/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => parseEnv(config as NodeJS.ProcessEnv),
    }),
    // Generous global ceiling; credential endpoints tighten it with @Throttle.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    ClubsModule,
    UsersModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
