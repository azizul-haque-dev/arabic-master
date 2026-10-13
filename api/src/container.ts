import { Queue } from 'bullmq';
import { logger } from './common/http/logger.js';
import { createAuthenticate } from './common/middleware/authenticate.js';
import { createRefreshGuard } from './common/middleware/refresh-guard.js';
import { AI_PROCESSING, SENTENCE_QUEUE_NAME, WORD_QUEUE_NAME } from './config/constants.js';
import { bullConnection } from './config/redis.js';
import { db } from './database/db.js';
import { createRedisService } from './database/redis.service.js';

import { createAiService } from './modules/ai/ai.service.js';
import { createAiWordService } from './modules/ai/ai-word.service.js';
import { createArabicEntityRepository } from './modules/arabic-entities/arabic-entity.repository.js';
import { createAuthController } from './modules/auth/auth.controller.js';
import { createAuthRepository } from './modules/auth/auth.repository.js';
import { createAuthService } from './modules/auth/auth.service.js';
import { createConsoleEmailService } from './modules/auth/email.service.js';
import { createOAuthService } from './modules/auth/oauth.service.js';
import { createPasswordService } from './modules/auth/password.service.js';
import { createSecurityLogger } from './modules/auth/security-logger.service.js';
import { createSessionRepository } from './modules/auth/session.repository.js';
import { createSessionService } from './modules/auth/session.service.js';
import { createTokenService } from './modules/auth/token.service.js';
import { createConversationController } from './modules/conversations/conversation.controller.js';
import { createConversationRepository } from './modules/conversations/conversation.repository.js';
import { createConversationService } from './modules/conversations/conversation.service.js';
import { createCourseController } from './modules/curriculum/courses/course.controller.js';
import { createCourseRepository } from './modules/curriculum/courses/course.repository.js';
import { createCourseService } from './modules/curriculum/courses/course.service.js';
import { createLessonController } from './modules/curriculum/lessons/lesson.controller.js';
import { createLessonRepository } from './modules/curriculum/lessons/lesson.repository.js';
import { createLessonService } from './modules/curriculum/lessons/lesson.service.js';
import { createSectionController } from './modules/curriculum/sections/section.controller.js';
import { createSectionRepository } from './modules/curriculum/sections/section.repository.js';
import { createSectionService } from './modules/curriculum/sections/section.service.js';
import { createSentenceController } from './modules/sentence/sentence.controller.js';
import { createSentenceRepository } from './modules/sentence/sentence.repository.js';
import { createSentenceService } from './modules/sentence/sentence.service.js';
import { createSentenceProcessor } from './modules/sentence/sentence.worker.js';
import { createUserRepository } from './modules/users/user.repository.js';
import { createUserService } from './modules/users/user.service.js';
import { createWordController } from './modules/words/word.controller.js';
import { createWordRepository } from './modules/words/word.repository.js';
import { createWordService } from './modules/words/word.service.js';
import { createWordProcessor } from './modules/words/word.worker.js';

/** Composition root: সব dependency এখানেই জোড়া লাগে (DI container-এর বদলি) */
export function buildContainer() {
  // ---- infra ----
  const redis = createRedisService(logger);
  const queueOpts = {
    connection: bullConnection(),
    defaultJobOptions: {
      attempts: AI_PROCESSING.QUEUE_RETRY_ATTEMPTS,
      backoff: { type: 'exponential' as const, delay: AI_PROCESSING.QUEUE_RETRY_DELAY_MS },
    },
  };
  const sentenceQueue = new Queue(SENTENCE_QUEUE_NAME, queueOpts);
  const wordQueue = new Queue(WORD_QUEUE_NAME, queueOpts);

  // ---- repositories ----
  const userRepo = createUserRepository(db);
  const authRepo = createAuthRepository(db);
  const sessionRepo = createSessionRepository(db);
  const entityRepo = createArabicEntityRepository(db);
  const wordRepo = createWordRepository(db);
  const sentenceRepo = createSentenceRepository(db);
  const conversationRepo = createConversationRepository(db);
  const courseRepo = createCourseRepository(db);
  const sectionRepo = createSectionRepository(db);
  const lessonRepo = createLessonRepository(db);

  // ---- services ----
  const users = createUserService(userRepo);
  const tokens = createTokenService();
  const passwords = createPasswordService();
  const security = createSecurityLogger(logger);
  const sessions = createSessionService({ repo: sessionRepo, redis, tokens, security, logger });
  const oauth = createOAuthService({ authRepo, users });
  const email = createConsoleEmailService(logger); // prod-এ আসল provider দিন
  const auth = createAuthService({ users, passwords, tokens, sessions, oauth, authRepo, security, email });

  const ai = createAiService();
  const aiWords = createAiWordService({ ai, entities: entityRepo, words: wordRepo, logger });
  const words = createWordService({ repo: wordRepo, entities: entityRepo, ai, queue: wordQueue });
  const sentences = createSentenceService({ repo: sentenceRepo, entities: entityRepo, ai, queue: sentenceQueue });
  const conversations = createConversationService(conversationRepo);
  const courses = createCourseService(courseRepo);
  const sections = createSectionService(sectionRepo);
  const lessons = createLessonService(lessonRepo);

  // ---- middleware ----
  const authenticate = createAuthenticate({ tokens, sessions: sessionRepo, users, redis, logger });
  const refreshGuard = createRefreshGuard(tokens);

  return {
    logger, redis, queues: { sentenceQueue, wordQueue },
    authenticate, refreshGuard,
    processors: {
      sentence: createSentenceProcessor({ sentences: sentenceRepo, entities: entityRepo, ai, aiWords, logger }),
      word: createWordProcessor({ words: wordRepo, entities: entityRepo, ai, logger }),
    },
    controllers: {
      auth: createAuthController({ auth, users }),
      word: createWordController(words),
      sentence: createSentenceController(sentences),
      conversation: createConversationController(conversations),
      course: createCourseController(courses),
      section: createSectionController(sections),
      lesson: createLessonController(lessons),
    },
  };
}
export type Container = ReturnType<typeof buildContainer>;
