import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { TokenService } from './api/auth/token.service';
import { parseEnv } from './config/env';

async function bootstrap() {
  const env = parseEnv();

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin:
      env.NODE_ENV === 'production'
        ? (env.CORS_ORIGINS?.split(',') ?? false)
        : true,
    credentials: true,
  });

  app.use(cookieParser());

  const tokens = app.get(TokenService);
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      req.userId = tokens.verifyAccessToken(auth.slice(7));
    }
    next();
  });

  await app.listen(env.PORT);
}
void bootstrap();
