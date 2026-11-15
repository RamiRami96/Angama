import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * The authenticated user's id. Always a string on default (required-auth)
 * routes; `undefined` on `@OptionalAuth()` routes for anonymous callers.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined =>
    ctx.switchToHttp().getRequest<Request>().userId,
);
