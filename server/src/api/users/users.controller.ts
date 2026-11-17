import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
import {
  myEventsQuerySchema,
  updateLanguagesSchema,
  updatePreferencesSchema,
  updateProfileSchema,
  type MyEventsQuery,
  type UpdateLanguagesDto,
  type UpdatePreferencesDto,
  type UpdateProfileDto,
} from '../../contracts';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Patch('me')
  @HttpCode(200)
  updateProfile(
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileDto,
    @CurrentUser() userId: string,
  ) {
    return this.users.updateProfile(userId, body);
  }

  @Get('me/preferences')
  getPreferences(@CurrentUser() userId: string) {
    return this.users.getPreferences(userId);
  }

  @Put('me/preferences')
  setPreferences(
    @Body(new ZodValidationPipe(updatePreferencesSchema))
    body: UpdatePreferencesDto,
    @CurrentUser() userId: string,
  ) {
    return this.users.setPreferences(userId, body);
  }

  @Put('me/languages')
  setLanguages(
    @Body(new ZodValidationPipe(updateLanguagesSchema))
    body: UpdateLanguagesDto,
    @CurrentUser() userId: string,
  ) {
    return this.users.setLanguages(userId, body);
  }

  @Get('me/events')
  getMyEvents(
    @Query(new ZodValidationPipe(myEventsQuerySchema)) query: MyEventsQuery,
    @CurrentUser() userId: string,
  ) {
    return this.users.getMyEvents(userId, query.role);
  }
}
