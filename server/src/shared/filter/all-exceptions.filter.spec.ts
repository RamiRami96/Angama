import { Controller, Get, Logger, NotFoundException } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Prisma } from '../../../generated/prisma/client';
import { AllExceptionsFilter } from './all-exceptions.filter';

@Controller('t')
class ThrowingController {
  @Get('http')
  http() {
    throw new NotFoundException('Club not found');
  }

  @Get('prisma')
  prisma() {
    throw new Prisma.PrismaClientKnownRequestError('SELECT secret', {
      code: 'P2025',
      clientVersion: 'test',
    });
  }

  @Get('boom')
  boom() {
    throw new Error('db password is hunter2');
  }
}

describe('AllExceptionsFilter (wired as APP_FILTER)', () => {
  async function app() {
    const moduleRef = await Test.createTestingModule({
      controllers: [ThrowingController],
      providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
    }).compile();
    const nest = moduleRef.createNestApplication();
    await nest.init();
    return nest;
  }

  let logError: jest.SpyInstance;
  beforeEach(() => {
    logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  it('keeps HttpException responses as they are', async () => {
    const nest = await app();
    const res = await request(nest.getHttpServer()).get('/t/http').expect(404);
    expect((res.body as { message: string }).message).toBe('Club not found');
    await nest.close();
  });

  it('turns Prisma P2025 into 404', async () => {
    const nest = await app();
    await request(nest.getHttpServer()).get('/t/prisma').expect(404);
    await nest.close();
  });

  it('returns a generic 500 without leaking the error message', async () => {
    const nest = await app();
    const res = await request(nest.getHttpServer()).get('/t/boom').expect(500);
    expect(JSON.stringify(res.body)).not.toContain('hunter2');
    expect(logError).toHaveBeenCalled();
    await nest.close();
  });
});
