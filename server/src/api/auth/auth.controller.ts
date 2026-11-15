import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/auth-mode.decorator';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
import {
  signInSchema,
  signUpSchema,
  type SignInDto,
  type SignUpDto,
} from './auth.schemas';
import { TokenService } from './token.service';

/** Brute-force / credential-stuffing ceiling for sign-in and sign-up, per IP. */
const CREDENTIAL_LIMIT = { default: { limit: 10, ttl: 60_000 } };

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private tokens: TokenService,
  ) {}

  @Public()
  @Throttle(CREDENTIAL_LIMIT)
  @Post('sign-up')
  async signUp(
    @Body(new ZodValidationPipe(signUpSchema)) body: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.signUp(body);
    return this.startSession(user, res);
  }

  @Public()
  @Throttle(CREDENTIAL_LIMIT)
  @Post('sign-in')
  @HttpCode(200)
  async signIn(
    @Body(new ZodValidationPipe(signInSchema)) body: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.signIn(body.email, body.password);
    return this.startSession(user, res);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = await this.tokens.rotate(req, res);
    return { accessToken };
  }

  @Public()
  @Post('sign-out')
  @HttpCode(200)
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.tokens.revoke(req, res);
    return { ok: true };
  }

  @Get('me')
  async me(@CurrentUser() userId: string) {
    const user = await this.auth.findById(userId);
    if (!user) throw new UnauthorizedException();
    return user;
  }

  @Delete('account')
  @HttpCode(200)
  async deleteAccount(
    @CurrentUser() userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.deleteAccount(userId);
    this.tokens.clearCookie(res);
    return { ok: true };
  }

  private async startSession(
    user: Awaited<ReturnType<AuthService['signIn']>>,
    res: Response,
  ) {
    await this.tokens.issueRefreshToken(user.id, res);
    return { user, accessToken: this.tokens.signAccessToken(user.id) };
  }
}
