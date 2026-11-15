import { Module } from '@nestjs/common';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';
import { RegistrationsService } from './registrations.service';

@Module({
  controllers: [ClubsController],
  providers: [ClubsService, RegistrationsService],
})
export class ClubsModule {}
