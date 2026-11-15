import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

describe('AuthController rate limiting', () => {
  async function app() {
    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1000 }])],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn().mockRejectedValue(new Error('unused')),
          },
        },
        { provide: TokenService, useValue: {} },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    }).compile();
    const nest = moduleRef.createNestApplication();
    await nest.init();
    return nest;
  }

  const attempt = (http: App) =>
    request(http)
      .post('/auth/sign-in')
      .send({ email: 'a@b.co', password: 'x' });

  it('answers 429 once sign-in exceeds the per-IP credential limit', async () => {
    const nest = await app();
    const http = nest.getHttpServer() as App;

    for (let i = 0; i < 10; i++) {
      expect((await attempt(http)).status).not.toBe(429);
    }
    expect((await attempt(http)).status).toBe(429);
    await nest.close();
  });

  it('does not apply the credential limit to other auth routes', async () => {
    const nest = await app();
    const http = nest.getHttpServer() as App;

    for (let i = 0; i < 15; i++) await attempt(http);
    // sign-out has its own (global) bucket and is unaffected
    expect((await request(http).post('/auth/sign-out')).status).not.toBe(429);
    await nest.close();
  });
});
