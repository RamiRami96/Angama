import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { toHttpException } from './http-exception.util';

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('boom: SELECT secret FROM x', {
    code,
    clientVersion: 'test',
  });

describe('toHttpException', () => {
  it('passes HttpExceptions through untouched', () => {
    const e = new BadRequestException('nope');
    expect(toHttpException(e)).toBe(e);
  });

  it('maps unique violations to 409', () => {
    expect(toHttpException(prismaError('P2002'))).toBeInstanceOf(
      ConflictException,
    );
  });

  it('maps record-not-found to 404', () => {
    expect(toHttpException(prismaError('P2025'))).toBeInstanceOf(
      NotFoundException,
    );
  });

  it('hides internals of unknown errors behind a generic 500', () => {
    const result = toHttpException(new Error('connection string leaked'));
    expect(result).toBeInstanceOf(InternalServerErrorException);
    expect(JSON.stringify(result.getResponse())).not.toContain('leaked');
  });
});
