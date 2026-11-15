import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import type { Env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  // Rate limiting keys on req.ip; behind a proxy that must be the real client.
  const proxyHops = config.get('TRUST_PROXY', { infer: true });
  if (proxyHops !== undefined) {
    app.set('trust proxy', proxyHops);
  }

  app.use(helmet());

  const corsOrigins = config.get('CORS_ORIGINS', { infer: true });
  app.enableCors({
    origin:
      config.get('NODE_ENV', { infer: true }) === 'production'
        ? (corsOrigins?.split(',') ?? false)
        : true,
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(config.get('PORT', { infer: true }));
}
void bootstrap();
