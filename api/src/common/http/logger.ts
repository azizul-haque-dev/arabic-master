import pino from 'pino';
import { env, isProd } from '../../config/env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.url',
      'req.query.code',
      'req.query.state',
      'req.query.accessToken',
      'req.query.refreshToken',
      'req.body.password',
      'req.body.newPassword',
      'req.body.refreshToken',
      'req.body.accessToken',
      'req.body.token',
      'req.body.code',
    ],
    censor: '**redacted**',
  },
  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          singleLine: true,
          colorize: true,
          translateTime: 'SYS:standard',
        },
      },
});
export type Logger = typeof logger;
