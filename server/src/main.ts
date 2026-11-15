import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { TokenService } from './api/auth/token.service';

async function bootstrap() {
  for (const name of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
    if (!process.env[name]) throw new Error(`${name} is not set`);
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? (process.env.CORS_ORIGINS?.split(',') ?? false)
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

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
