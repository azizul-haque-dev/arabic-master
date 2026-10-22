import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import { v7 as randomUUIDv7 } from 'uuid';
import {
  createErrorHandler,
  notFound,
} from './common/middleware/error-handler.js';

import { logger } from './common/http/logger.js';
import { globalLimiter } from './common/middleware/rate-limit.js';
import { corsOrigins, env, isProd } from './config/env.js';
import apiRoutes from './routes/index.js';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', true);

  app.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'private, no-store');
    next();
  });

  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const existing = req.headers['x-request-id'];
        const id =
          typeof existing === 'string' && existing.length > 0
            ? existing
            : randomUUIDv7();
        res.setHeader('X-Request-Id', id);
        return id;
      },
    }),
  );
  app.use(helmet());
  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(`/${env.API_PREFIX}/v1`, globalLimiter, apiRoutes);
  app.use(notFound);
  app.use(createErrorHandler(logger));
  return app;
}
