import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import passport from 'passport';
import { pinoHttp } from 'pino-http';
import { randomUUID } from 'node:crypto';
import { createErrorHandler, notFound } from './common/middleware/error-handler.js';
import { globalLimiter } from './common/middleware/rate-limit.js';
import { corsOrigins, env, isProd } from './config/env.js';
import { pool } from './database/db.js';
import type { Container } from './container.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createConversationRouter } from './modules/conversations/conversation.routes.js';
import { createCourseRouter } from './modules/curriculum/courses/course.routes.js';
import { createLessonRouter } from './modules/curriculum/lessons/lesson.routes.js';
import { createSectionRouter } from './modules/curriculum/sections/section.routes.js';
import { createSentenceRouter } from './modules/sentence/sentence.routes.js';
import { createWordRouter } from './modules/words/word.routes.js';

export function createApp(c: Container) {
  const app = express();

  // reverse proxy-র পেছনে সঠিক client IP (rate limit ও session IP-র জন্য)
  if (isProd) app.set('trust proxy', 1);

  app.use(
    pinoHttp({
      logger: c.logger,
      genReqId: (req, res) => {
        const existing = req.headers['x-request-id'];
        const id = typeof existing === 'string' && existing.length > 0 ? existing : randomUUID();
        res.setHeader('X-Request-Id', id);
        return id;
      },
    }),
  );
  app.use(helmet());
  app.use(cors({ origin: corsOrigins, credentials: true })); // credentials: refresh cookie-র জন্য
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(globalLimiter);
  app.use(passport.initialize());

  // ---- /api/v1 ----
  const v1 = express.Router();

  v1.get('/health', async (_req, res) => {
    const heapMb = process.memoryUsage().heapUsed / 1024 / 1024;
    try {
      await pool.query('SELECT 1');
      await c.redis.client.ping();
    } catch {
      return void res.status(503).json({ status: 'error' });
    }
    const healthy = heapMb < 300;
    res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'error', heapMb: Math.round(heapMb) });
  });

  const { authenticate, controllers } = c;
  v1.use('/auth', createAuthRouter({ controller: controllers.auth, authenticate, refreshGuard: c.refreshGuard }));
  v1.use('/words', createWordRouter({ controller: controllers.word, authenticate }));
  v1.use('/sentences', createSentenceRouter({ controller: controllers.sentence, authenticate }));
  v1.use('/conversations', createConversationRouter({ controller: controllers.conversation, authenticate }));
  v1.use('/courses', createCourseRouter({ controller: controllers.course, sectionController: controllers.section, authenticate }));
  v1.use('/sections', createSectionRouter({ controller: controllers.section, lessonController: controllers.lesson, authenticate }));
  v1.use('/lessons', createLessonRouter({ controller: controllers.lesson, authenticate }));

  app.use(`/${env.API_PREFIX}/v1`, v1);

  app.use(notFound);
  app.use(createErrorHandler(c.logger));
  return app;
}
