import { Controller, Get } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { OptionalAuth, Public } from '../decorators/auth-mode.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { TokenService } from '../token.service';
import { AuthGuard } from './auth.guard';

@Controller('t')
class ProbeController {
  @Get('required')
  required(@CurrentUser() userId: string) {
    return { userId };
  }

  @OptionalAuth()
  @Get('optional')
  optional(@CurrentUser() userId?: string) {
    return { userId: userId ?? null };
  }

  @Public()
  @Get('public')
  open() {
    return { ok: true };
  }
}

describe('AuthGuard (global)', () => {
  const verifyAccessToken = jest.fn((t: string) =>
    t === 'good' ? 'user-1' : undefined,
  );

  async function app() {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProbeController],
      providers: [
        { provide: TokenService, useValue: { verifyAccessToken } },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    const nest = moduleRef.createNestApplication();
    await nest.init();
    return nest;
  }

  beforeEach(() => verifyAccessToken.mockClear());

  it('requires a token by default', async () => {
    const nest = await app();
    const http = nest.getHttpServer() as App;
    await request(http).get('/t/required').expect(401);
    await request(http)
      .get('/t/required')
      .set('Authorization', 'Bearer bad')
      .expect(401);
    await request(http)
      .get('/t/required')
      .set('Authorization', 'Basic good')
      .expect(401);
    await nest.close();
  });

  it('exposes the user id to the handler when the token is valid', async () => {
    const nest = await app();
    const res = await request(nest.getHttpServer())
      .get('/t/required')
      .set('Authorization', 'Bearer good')
      .expect(200);
    expect(res.body as unknown).toEqual({ userId: 'user-1' });
    await nest.close();
  });

  it('lets anonymous callers through @OptionalAuth but still identifies valid ones', async () => {
    const nest = await app();
    const http = nest.getHttpServer() as App;
    expect((await request(http).get('/t/optional').expect(200)).body).toEqual({
      userId: null,
    });
    expect(
      (
        await request(http)
          .get('/t/optional')
          .set('Authorization', 'Bearer bad')
          .expect(200)
      ).body,
    ).toEqual({ userId: null });
    expect(
      (
        await request(http)
          .get('/t/optional')
          .set('Authorization', 'Bearer good')
          .expect(200)
      ).body,
    ).toEqual({ userId: 'user-1' });
    await nest.close();
  });

  it('does not touch tokens on @Public routes', async () => {
    const nest = await app();
    await request(nest.getHttpServer())
      .get('/t/public')
      .set('Authorization', 'Bearer good')
      .expect(200);
    expect(verifyAccessToken).not.toHaveBeenCalled();
    await nest.close();
  });
});
