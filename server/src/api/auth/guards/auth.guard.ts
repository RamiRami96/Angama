import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import {
  AUTH_MODE_KEY,
  type AuthMode,
} from '../decorators/auth-mode.decorator';
import { TokenService } from '../token.service';

const BEARER_PREFIX = 'Bearer ';

/** Registered globally (APP_GUARD): every route requires a valid access token unless marked otherwise. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tokens: TokenService,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const mode = this.reflector.getAllAndOverride<AuthMode | undefined>(
      AUTH_MODE_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (mode === 'public') return true;

    const req = ctx.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    req.userId = header?.startsWith(BEARER_PREFIX)
      ? this.tokens.verifyAccessToken(header.slice(BEARER_PREFIX.length))
      : undefined;

    if (!req.userId && mode !== 'optional') throw new UnauthorizedException();
    return true;
  }
}
