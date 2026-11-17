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

@Controller('events')
export class EventsController {
  constructor(private events: EventsService) {}

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
}
