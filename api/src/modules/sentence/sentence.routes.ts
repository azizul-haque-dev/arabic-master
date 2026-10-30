import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { authorize } from '../../common/middleware/authorize.js';
import { validate } from '../../common/middleware/validate.js';
import { idParamSchema } from '../../common/schemas.js';
import { Role } from '../../database/drizzle/enums.js';
import { SentenceController } from './sentence.controller.js';
import {
  createSentenceSchema,
  generateSentenceAiSchema,
  listSentenceQuerySchema,
  updateSentenceSchema,
} from './sentence.schemas.js';

const sentenceRoutes = Router();
const shortSentenceRoutes = Router();
const staff = [authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN)];
const params = validate({ params: idParamSchema });

// TODO(security): এই দুটো public। DRAFT/REJECTED sentence বাইরে যাচ্ছে (পর্ব ০ #2)। আগের আচরণ রাখা হয়েছে।
sentenceRoutes.get(
  '/',
  validate({ query: listSentenceQuerySchema }),
  SentenceController.list,
);
sentenceRoutes.get(
  '/short',
  validate({ query: listSentenceQuerySchema }),
  SentenceController.listShort,
);
sentenceRoutes.get(
  '/long',
  validate({ query: listSentenceQuerySchema }),
  SentenceController.listLong,
);
sentenceRoutes.get('/:id', params, SentenceController.getOne);

sentenceRoutes.post(
  '/',
  ...staff,
  validate({ body: createSentenceSchema }),
  SentenceController.create,
);
sentenceRoutes.post(
  '/short',
  ...staff,
  validate({ body: createSentenceSchema }),
  SentenceController.createShort,
);
sentenceRoutes.post(
  '/long',
  ...staff,
  validate({ body: createSentenceSchema }),
  SentenceController.createLong,
);
sentenceRoutes.post(
  '/ai',
  ...staff,
  validate({ body: generateSentenceAiSchema }),
  SentenceController.generate,
);
sentenceRoutes.post(
  '/short/ai',
  ...staff,
  validate({ body: generateSentenceAiSchema }),
  SentenceController.generateShort,
);
sentenceRoutes.post(
  '/ai/short',
  ...staff,
  validate({ body: generateSentenceAiSchema }),
  SentenceController.generateShort,
);
sentenceRoutes.post(
  '/long/ai',
  ...staff,
  validate({ body: generateSentenceAiSchema }),
  SentenceController.generateLong,
);
sentenceRoutes.post(
  '/ai/long',
  ...staff,
  validate({ body: generateSentenceAiSchema }),
  SentenceController.generateLong,
);
sentenceRoutes.post(
  '/:id/resync-words',
  ...staff,
  params,
  SentenceController.resyncWords,
);
sentenceRoutes.patch(
  '/:id',
  ...staff,
  validate({ params: idParamSchema, body: updateSentenceSchema }),
  SentenceController.update,
);
sentenceRoutes.delete('/:id', ...staff, params, SentenceController.remove);

// Dedicated /short-sentences router
shortSentenceRoutes.get(
  '/',
  validate({ query: listSentenceQuerySchema }),
  SentenceController.listShort,
);
shortSentenceRoutes.get('/:id', params, SentenceController.getOne);
shortSentenceRoutes.post(
  '/',
  ...staff,
  validate({ body: createSentenceSchema }),
  SentenceController.createShort,
);
shortSentenceRoutes.post(
  '/ai',
  ...staff,
  validate({ body: generateSentenceAiSchema }),
  SentenceController.generateShort,
);
shortSentenceRoutes.post(
  '/:id/resync-words',
  ...staff,
  params,
  SentenceController.resyncWords,
);
shortSentenceRoutes.patch(
  '/:id',
  ...staff,
  validate({ params: idParamSchema, body: updateSentenceSchema }),
  SentenceController.update,
);
shortSentenceRoutes.delete('/:id', ...staff, params, SentenceController.remove);

export { sentenceRoutes, shortSentenceRoutes };
