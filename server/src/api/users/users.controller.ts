import { Body, Controller, Get, HttpCode, Patch } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
import { updateProfileSchema, type UpdateProfileDto } from '../../contracts';
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

  @Get('me/applications')
  getMyApplications(@CurrentUser() userId: string) {
    return this.users.getMyApplications(userId);
  }

  @Get('me/hosted-club')
  getMyHostedClub(@CurrentUser() userId: string) {
    return this.users.getMyHostedClub(userId);
  }
}
