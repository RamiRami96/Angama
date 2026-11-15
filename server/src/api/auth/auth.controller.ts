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
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
import {
  signInSchema,
  signUpSchema,
  type SignInDto,
  type SignUpDto,
} from './auth.schemas';
import { TokenService } from './token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private tokens: TokenService,
  ) {}

  @Post('sign-up')
  async signUp(
    @Body(new ZodValidationPipe(signUpSchema)) body: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.signUp(body);
    return this.startSession(user, res);
  }

  @Post('sign-in')
  @HttpCode(200)
  async signIn(
    @Body(new ZodValidationPipe(signInSchema)) body: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.signIn(body.email, body.password);
    return this.startSession(user, res);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = await this.tokens.rotate(req, res);
    return { accessToken };
  }

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
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    const user = await this.auth.findById(req.userId!);
    if (!user) throw new UnauthorizedException();
    return user;
  }

  @Delete('account')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async deleteAccount(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.deleteAccount(req.userId!);
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
