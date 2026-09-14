import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { LoggerModule } from 'nestjs-pino';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware.js';
import configuration from './config/configuration.js';
import { validateEnv } from './config/env.validation.js';
import { HealthModule } from './health/health.module.js';

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
        const isProduction = configService.get<string>('app.env') === 'production';

        return {
          pinoHttp: {
            level: configService.get<string>('app.logLevel') ?? 'debug',
            genReqId: (req: Record<string, any>, res: Record<string, any>) => {
              const existing = req.headers['x-request-id'];
              const id =
                typeof existing === 'string' && existing.length > 0
                  ? existing
                  : randomUUID();
              res.setHeader('X-Request-Id', id);
              return id;
            },
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.password',
                'req.body.accessToken',
                'req.body.refreshToken',
              ],
              censor: '**redacted**',
            },
            transport: isProduction
              ? undefined
              : {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'SYS:standard',
                },
              },
            customSuccessMessage: (req: Record<string, any>, res: Record<string, any>) =>
              `${req.method} ${req.url} -> ${res.statusCode}`,
          },
        };
      },
    }),
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}