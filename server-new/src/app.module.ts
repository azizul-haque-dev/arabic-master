import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { randomUUID } from 'crypto';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware.js';
import configuration from './config/configuration.js';
import { validateEnv } from './config/env.validation.js';
import { PrismaModule } from './database/prisma.module.js';
import { RedisModule } from './database/redis.module.js';
import { HealthModule } from './health/health.module.js';

import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AiModule } from './ai/ai.module.js';
import { AiModule } from './modules/ai/ai.module.js';
import { WordModule } from './modules/word/word.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
      envFilePath: ['.env'],
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get<string>('app.env') === 'production';

        // Define file rolling target
        const fileTransportTarget = {
          target: 'pino-roll',
          options: {
            file: join(process.cwd(), 'logs', 'app'), // Saves to your root directory /logs/app.YYYYMMDD.log
            frequency: 'daily',
            size: '10m',
            mkdir: true,
          },
          level: configService.get<string>('app.logLevel') ?? 'debug',
        };

        // Define human-readable console target
        const consolePrettyTarget = {
          target: 'pino-pretty',
          options: { singleLine: true, colorize: true, translateTime: 'SYS:standard' },
          level: configService.get<string>('app.logLevel') ?? 'debug',
        };

        return {
          pinoHttp: {
            level: configService.get<string>('app.logLevel') ?? 'debug',
            genReqId: (req: Record<string, any>, res: Record<string, any>) => {
              const existing = req.headers['x-request-id'];
              const id =
                typeof existing === 'string' && existing.length > 0 ? existing : randomUUID();
              res.setHeader('X-Request-Id', id);
              return id;
            },
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.password',
                'req.body.newPassword',
                'req.body.refreshToken',
                'req.body.accessToken',
                'req.body.token',
              ],
              censor: '**redacted**',
            },
            // 👈 Custom transport configuration incorporating pino-roll
            transport: isProd
              ? {
                targets: [
                  fileTransportTarget,
                  // If you also want standard JSON console streaming in production alongside files, add:
                  { target: 'pino/file', options: { destination: 1 }, level: configService.get<string>('app.logLevel') ?? 'info' }
                ]
              }
              : {
                targets: [
                  consolePrettyTarget,
                  fileTransportTarget // Still saves log files locally while developing
                ]
              },
          },
        };
      },
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
    RedisModule,
    HealthModule,
    UsersModule,
    AuthModule,
    PrismaModule,
    AiModule,
    WordModule
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
