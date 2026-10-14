import { Router } from 'express';
import { pool } from '../database/db.js';
import { appDependencies } from '../app.setup.js';
import { createAuthRouter } from '../modules/auth/auth.routes.js';
import { createConversationRouter } from '../modules/conversations/conversation.routes.js';
import { createCourseRouter } from '../modules/curriculum/courses/course.routes.js';
import { createLessonRouter } from '../modules/curriculum/lessons/lesson.routes.js';
import { createSectionRouter } from '../modules/curriculum/sections/section.routes.js';
import { createSentenceRouter } from '../modules/sentence/sentence.routes.js';
import { createWordRouter } from '../modules/words/word.routes.js';

const router = Router();
const { authenticate, controllers } = appDependencies;

router.get('/health', async (_req, res) => {
  const heapMb = process.memoryUsage().heapUsed / 1024 / 1024;

  try {
    await pool.query('SELECT 1');
    await appDependencies.redis.client.ping();
  } catch {
    return void res.status(503).json({ status: 'error' });
  }

  const healthy = heapMb < 300;
  res
    .status(healthy ? 200 : 503)
    .json({ status: healthy ? 'ok' : 'error', heapMb: Math.round(heapMb) });
});

router.use("/auth", authRoutes);

// router.use(
//   '/auth',
//   createAuthRouter({
//     controller: controllers.auth,
//     authenticate,
//     refreshGuard: appDependencies.refreshGuard,
//   }),
// );
// router.use(
//   '/words',
//   createWordRouter({ controller: controllers.word, authenticate }),
// );
// router.use(
//   '/sentences',
//   createSentenceRouter({ controller: controllers.sentence, authenticate }),
// );
// router.use(
//   '/conversations',
//   createConversationRouter({
//     controller: controllers.conversation,
//     authenticate,
//   }),
// );
// router.use(
//   '/courses',
//   createCourseRouter({
//     controller: controllers.course,
//     sectionController: controllers.section,
//     authenticate,
//   }),
// );
// router.use(
//   '/sections',
//   createSectionRouter({
//     controller: controllers.section,
//     lessonController: controllers.lesson,
//     authenticate,
//   }),
// );
// router.use(
//   '/lessons',
//   createLessonRouter({ controller: controllers.lesson, authenticate }),
// );

export default router;
