import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { z } from 'zod';
import { ParticipationStatus } from '../../../generated/prisma/enums';
import { OptionalAuth } from '../auth/decorators/auth-mode.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
import {
  createEventSchema,
  listEventsQuerySchema,
  updateEventSchema,
  type CreateEventDto,
  type ListEventsQuery,
  type UpdateEventDto,
} from '../../contracts';
import { EventsService } from './events.service';
import { ParticipationsService } from './participations.service';

const participantStatusSchema = z.enum(ParticipationStatus).optional();

@Controller('events')
export class EventsController {
  constructor(
    private events: EventsService,
    private participations: ParticipationsService,
  ) {}

  @OptionalAuth()
  @Get()
  list(
    @Query(new ZodValidationPipe(listEventsQuerySchema)) query: ListEventsQuery,
    @CurrentUser() userId?: string,
  ) {
    return this.events.list(userId, query);
  }

  @OptionalAuth()
  @Get(':id')
  getOne(@Param('id') id: string, @CurrentUser() userId?: string) {
    return this.events.getOne(id, userId);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createEventSchema)) body: CreateEventDto,
    @CurrentUser() userId: string,
  ) {
    return this.events.create(userId, body);
  }

  @Patch(':id')
  @HttpCode(200)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEventSchema)) body: UpdateEventDto,
    @CurrentUser() userId: string,
  ) {
    return this.events.update(id, userId, body);
  }

  @Post(':id/publish')
  @HttpCode(200)
  publish(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.events.publish(id, userId);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  cancel(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.events.cancel(id, userId);
  }

  @Post(':id/participation')
  @HttpCode(200)
  requestParticipation(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.participations.request(id, userId);
  }

  @Post(':id/participation/cancel')
  @HttpCode(200)
  cancelParticipation(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.participations.cancel(id, userId);
  }

  @Get(':id/participants')
  listParticipants(
    @Param('id') id: string,
    @Query('status', new ZodValidationPipe(participantStatusSchema))
    status: ParticipationStatus | undefined,
    @CurrentUser() userId: string,
  ) {
    return this.participations.list(id, userId, status);
  }

  @Patch(':id/participants/:userId/approve')
  @HttpCode(200)
  approveParticipant(
    @Param('id') id: string,
    @Param('userId') participantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.participations.approve(id, participantId, userId);
  }

  @Patch(':id/participants/:userId/reject')
  @HttpCode(200)
  rejectParticipant(
    @Param('id') id: string,
    @Param('userId') participantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.participations.reject(id, participantId, userId);
  }
}
