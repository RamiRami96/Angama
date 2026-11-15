import {
  Body,
  Controller,
  Delete,
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
  createClubSchema,
  listClubsQuerySchema,
  type CreateClubDto,
  type ListClubsQuery,
} from '../../contracts';
import { ClubsService } from './clubs.service';
import { RegistrationsService } from './registrations.service';

@Controller('clubs')
export class ClubsController {
  constructor(
    private clubs: ClubsService,
    private registrations: RegistrationsService,
  ) {}

  @OptionalAuth()
  @Get()
  getAll(
    @Query(new ZodValidationPipe(listClubsQuerySchema)) query: ListClubsQuery,
    @CurrentUser() userId?: string,
  ) {
    return this.clubs.getAll(userId, query);
  }

  @OptionalAuth()
  @Get(':id')
  getOne(@Param('id') id: string, @CurrentUser() userId?: string) {
    return this.clubs.getOne(id, userId);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createClubSchema)) body: CreateClubDto,
    @CurrentUser() userId: string,
  ) {
    return this.clubs.create(userId, body);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.clubs.remove(id, userId);
  }

  @Post(':id/apply')
  @HttpCode(200)
  apply(@Param('id') clubId: string, @CurrentUser() userId: string) {
    return this.registrations.apply(clubId, userId);
  }

  @Get(':id/applicants')
  getApplicants(@Param('id') clubId: string, @CurrentUser() userId: string) {
    return this.registrations.getApplicants(clubId, userId);
  }

  @Patch(':id/applicants/:userId/accept')
  @HttpCode(200)
  accept(
    @Param('id') clubId: string,
    @Param('userId') applicantId: string,
    @CurrentUser() hostId: string,
  ) {
    return this.registrations.accept(clubId, applicantId, hostId);
  }

  @Patch(':id/applicants/:userId/reject')
  @HttpCode(200)
  reject(
    @Param('id') clubId: string,
    @Param('userId') applicantId: string,
    @CurrentUser() hostId: string,
  ) {
    return this.registrations.reject(clubId, applicantId, hostId);
  }
}
