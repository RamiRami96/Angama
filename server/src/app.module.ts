import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
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
    PrismaModule,
    AuthModule,
    ClubsModule,
    UsersModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
