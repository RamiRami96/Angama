import { SetMetadata } from '@nestjs/common';

export const AUTH_MODE_KEY = 'authMode';

/**
 * Routes are authenticated by default (global AuthGuard).
 * - `public`:   no token needed or looked at (sign-in, refresh, ...)
 * - `optional`: token is used when valid, but anonymous access is allowed
 */
export type AuthMode = 'public' | 'optional';

export const Public = () =>
  SetMetadata(AUTH_MODE_KEY, 'public' satisfies AuthMode);
export const OptionalAuth = () =>
  SetMetadata(AUTH_MODE_KEY, 'optional' satisfies AuthMode);
