import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { toHttpException } from '../util/http-exception.util';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  override catch(exception: unknown, host: ArgumentsHost) {
    const mapped = toHttpException(exception);
    // Log what we are hiding from the client: unexpected failures only.
    if (!(exception instanceof HttpException)) {
      this.logger.error(
        exception instanceof Error ? exception.message : String(exception),
        exception instanceof Error ? exception.stack : undefined,
      );
    }
    super.catch(mapped, host);
  }
}
