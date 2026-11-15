import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import type { Env } from '../../config/env';
import type { PrismaService } from '../../prisma/prisma.service';
import { TokenService } from './token.service';

const env: Partial<Env> = {
  JWT_ACCESS_SECRET: 'access-secret',
  JWT_REFRESH_SECRET: 'refresh-secret',
  NODE_ENV: 'production',
  COOKIE_SAMESITE: 'none',
};

function setup() {
  const db = {
    refreshToken: {
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  };
  const config = {
    get: (key: keyof Env) => env[key],
  } as unknown as ConfigService<Env, true>;
  const service = new TokenService(
    new JwtService(),
    db as unknown as PrismaService,
    config,
  );
  const res = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response & {
    cookie: jest.Mock;
    clearCookie: jest.Mock;
  };
  return { service, db, res };
}

const reqWithCookie = (token?: string) =>
  ({ cookies: token ? { refresh_token: token } : {} }) as unknown as Request;

describe('TokenService access tokens', () => {
  it('round-trips a user id', () => {
    const { service } = setup();
    expect(service.verifyAccessToken(service.signAccessToken('u1'))).toBe('u1');
  });

  it('rejects garbage and tokens signed with another secret', () => {
    const { service } = setup();
    expect(service.verifyAccessToken('nope')).toBeUndefined();
    const forged = new JwtService().sign({ sub: 'u1' }, { secret: 'other' });
    expect(service.verifyAccessToken(forged)).toBeUndefined();
  });
});

describe('TokenService refresh tokens', () => {
  it('sets an httpOnly cookie using validated config (secure + sameSite)', async () => {
    const { service, res } = setup();
    await service.issueRefreshToken('u1', res);
    expect(res.cookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/auth',
      }),
    );
  });

  it('forces Secure when SameSite=None, even outside production', async () => {
    const { service, res } = setup();
    env.NODE_ENV = 'development';
    try {
      await service.issueRefreshToken('u1', res);
    } finally {
      env.NODE_ENV = 'production';
    }
    expect(res.cookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.any(String),
      expect.objectContaining({ secure: true, sameSite: 'none' }),
    );
  });

  async function issuedToken(
    service: TokenService,
    res: Response & { cookie: jest.Mock },
  ) {
    await service.issueRefreshToken('u1', res);
    return (res.cookie.mock.calls[0] as [string, string])[1];
  }

  it('rotates a known token and returns a new access token', async () => {
    const { service, res } = setup();
    const token = await issuedToken(service, res);
    res.cookie.mockClear();

    const access = await service.rotate(reqWithCookie(token), res);

    expect(service.verifyAccessToken(access)).toBe('u1');
    expect(res.cookie).toHaveBeenCalledTimes(1); // new refresh cookie
  });

  it('treats a replayed token as theft: revokes every session of the user', async () => {
    const { service, db, res } = setup();
    const token = await issuedToken(service, res);
    db.refreshToken.deleteMany.mockResolvedValueOnce({ count: 0 }); // already used

    await expect(
      service.rotate(reqWithCookie(token), res),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(db.refreshToken.deleteMany).toHaveBeenLastCalledWith({
      where: { userId: 'u1' },
    });
    expect(res.clearCookie).toHaveBeenCalled();
  });

  it('rejects a missing or forged cookie', async () => {
    const { service, res } = setup();
    await expect(service.rotate(reqWithCookie(), res)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(
      service.rotate(reqWithCookie('forged'), res),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
