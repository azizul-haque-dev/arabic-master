import {
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);
  app.useLogger(app.get(Logger));

  const apiPrefix = configService.get<string>('app.apiPrefix') ?? 'api';
  const corsOrigins = configService.get<string[]>('app.cors.origin') ?? [];
  const swaggerEnabled = configService.get<boolean>('app.swagger.enabled');
  const swaggerPath = configService.get<string>('app.swagger.path') ?? 'docs';
  const port = configService.get<number>('app.port') ?? 5000;

  // Security
  app.use(helmet());
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Body size limits
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  // Prefix + versioning: /api/v1
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Graceful shutdown
  app.enableShutdownHooks();

  // Swagger (env-toggleable, not hardcoded to dev-only)
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('NestJS Boilerplate API')
      .setDescription('Production-ready NestJS backend foundation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document);
  }

  await app.listen(port);
}

bootstrap();