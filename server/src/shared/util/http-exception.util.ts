import {
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';

/**
 * Maps any thrown value to an HttpException. Known Prisma errors become
 * meaningful 4xx responses; everything else becomes a generic 500 so internal
 * details (SQL, stack, Prisma messages) never reach the client.
 */
export function toHttpException(err: unknown): HttpException {
  if (err instanceof HttpException) return err;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return new ConflictException('Resource already exists');
      case 'P2025':
        return new NotFoundException('Resource not found');
    }
  }

  return new InternalServerErrorException();
}
