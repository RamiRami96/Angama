import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';
import type { CookieOptions, Request, Response } from 'express';
import type { Env } from '../../config/env';
import { PrismaService } from '../../prisma/prisma.service';

const REFRESH_COOKIE = 'refresh_token';
const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;
const ALGORITHM = 'HS256';

type RefreshPayload = { sub: string; jti: string };

@Injectable()
export class TokenService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
    private config: ConfigService<Env, true>,
  ) {}

  verifyAccessToken(token: string): string | undefined {
    try {
      const { sub } = this.jwt.verify<{ sub: string }>(token, {
        secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
        algorithms: [ALGORITHM],
      });
      return sub;
    } catch {
      return undefined;
    }
  }

  signAccessToken(userId: string): string {
    return this.jwt.sign(
      { sub: userId },
      {
        secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
        algorithm: ALGORITHM,
        expiresIn: ACCESS_TTL_SECONDS,
      },
    );
  }

  async issueRefreshToken(userId: string, res: Response): Promise<void> {
    const id = randomUUID();
    const token = this.jwt.sign(
      { sub: userId },
      {
        secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
        algorithm: ALGORITHM,
        expiresIn: REFRESH_TTL_SECONDS,
        jwtid: id,
      },
    );
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({
        where: { userId, expiresAt: { lt: now } },
      }),
      this.prisma.refreshToken.create({
        data: {
          id,
          userId,
          tokenHash: hash(token),
          expiresAt: new Date(now.getTime() + REFRESH_TTL_SECONDS * 1000),
        },
      }),
    ]);

    res.cookie(REFRESH_COOKIE, token, {
      ...this.cookieOptions(),
      maxAge: REFRESH_TTL_SECONDS * 1000,
    });
  }

  async rotate(req: Request, res: Response): Promise<string> {
    const token = readCookie(req);
    if (!token) throw new UnauthorizedException();

    let payload: RefreshPayload;
    try {
      payload = this.jwt.verify<RefreshPayload>(token, {
        secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
        algorithms: [ALGORITHM],
      });
    } catch {
      this.clearCookie(res);
      throw new UnauthorizedException();
    }

    const { count } = await this.prisma.refreshToken.deleteMany({
      where: { id: payload.jti, tokenHash: hash(token) },
    });
    if (count === 0) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId: payload.sub },
      });
      this.clearCookie(res);
      throw new UnauthorizedException();
    }

    await this.issueRefreshToken(payload.sub, res);
    return this.signAccessToken(payload.sub);
  }

  async revoke(req: Request, res: Response): Promise<void> {
    const token = readCookie(req);
    if (token) {
      await this.prisma.refreshToken.deleteMany({
        where: { tokenHash: hash(token) },
      });
    }
    this.clearCookie(res);
  }

  clearCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, this.cookieOptions());
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get('NODE_ENV', { infer: true }) === 'production',
      sameSite: this.config.get('COOKIE_SAMESITE', { infer: true }) ?? 'lax',
      path: '/auth',
    };
  }
}

function readCookie(req: Request): string | undefined {
  return (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
}

function hash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
