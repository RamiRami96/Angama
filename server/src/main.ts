import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import type { Env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

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
