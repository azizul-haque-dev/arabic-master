import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { validate } from '../../common/middleware/validate.js';
import { listConversationQuerySchema } from '../conversations/conversation.schemas.js';
import { listCourseQuerySchema } from '../curriculum/courses/course.schemas.js';
import { listSentenceQuerySchema } from '../sentence/sentence.schemas.js';
import { listWordQuerySchema } from '../words/word.schemas.js';
import { LearnerController } from './learner.controller.js';

const learnerRoutes = Router();

learnerRoutes.get('/overview', authenticate, LearnerController.overview);

learnerRoutes.get(
  '/words',
  validate({ query: listWordQuerySchema }),
  LearnerController.words,
);

learnerRoutes.get(
  '/sentences',
  validate({ query: listSentenceQuerySchema }),
  LearnerController.sentences,
);

learnerRoutes.get(
  '/conversations',
  validate({ query: listConversationQuerySchema }),
  LearnerController.conversations,
);

learnerRoutes.get(
  '/courses',
  validate({ query: listCourseQuerySchema }),
  LearnerController.courses,
);

export { learnerRoutes };
