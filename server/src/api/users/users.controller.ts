import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
import { updateProfileSchema, type UpdateProfileDto } from './users.schemas';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Patch('me')
  @HttpCode(200)
  updateProfile(
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileDto,
    @Req() req: Request,
  ) {
    return this.users.updateProfile(this.requireUser(req), body);
  }

  @Get('me/applications')
  getMyApplications(@Req() req: Request) {
    return this.users.getMyApplications(this.requireUser(req));
  }

  @Get('me/hosted-club')
  getMyHostedClub(@Req() req: Request) {
    return this.users.getMyHostedClub(this.requireUser(req));
  }

  private requireUser(req: Request): string {
    const id = req.userId;
    if (!id) throw new UnauthorizedException();
    return id;
  }
}
