import { Router } from 'express';
import { pool } from '../database/db.js';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { conversationRoutes } from '../modules/conversations/conversation.routes.js';
import { courseRoutes } from '../modules/curriculum/courses/course.routes.js';
import { lessonRoutes } from '../modules/curriculum/lessons/lesson.routes.js';
import { sectionRoutes } from '../modules/curriculum/sections/section.routes.js';
import { sentenceRoutes } from '../modules/sentence/sentence.routes.js';
import { wordRoutes } from '../modules/words/word.routes.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const heapMb = process.memoryUsage().heapUsed / 1024 / 1024;

  try {
    await pool.query('SELECT 1');
  } catch {
    return void res.status(503).json({ status: 'error' });
  }

  const healthy = heapMb < 300;
  res
    .status(healthy ? 200 : 503)
    .json({ status: healthy ? 'ok' : 'error', heapMb: Math.round(heapMb) });
});

router.use('/auth', authRoutes);
router.use('/words', wordRoutes);
router.use('/sentences', sentenceRoutes);
router.use('/conversations', conversationRoutes);
router.use('/courses', courseRoutes);
router.use('/sections', sectionRoutes);
router.use('/lessons', lessonRoutes);

export default router;
