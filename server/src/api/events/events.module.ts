import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { ParticipationsService } from './participations.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService, ParticipationsService],
  exports: [EventsService],
})
export class EventsModule {}
