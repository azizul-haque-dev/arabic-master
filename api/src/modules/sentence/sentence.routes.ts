import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { authorize } from '../../common/middleware/authorize.js';
import { validate } from '../../common/middleware/validate.js';
import { idParamSchema } from '../../common/schemas.js';
import { Role } from '../../database/drizzle/enums.js';
import { generateContentSchema } from '../ai/generate-content.schema.js';
import { SentenceController } from './sentence.controller.js';
import {
  createSentenceSchema,
  listSentenceQuerySchema,
  updateSentenceSchema,
} from './sentence.schemas.js';

const sentenceRoutes = Router();
const staff = [authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN)];
const params = validate({ params: idParamSchema });

// TODO(security): এই দুটো public। DRAFT/REJECTED sentence বাইরে যাচ্ছে (পর্ব ০ #2)। আগের আচরণ রাখা হয়েছে।
sentenceRoutes.get(
  '/',
  validate({ query: listSentenceQuerySchema }),
  SentenceController.list,
);
sentenceRoutes.get('/:id', params, SentenceController.getOne);

sentenceRoutes.post(
  '/',
  ...staff,
  validate({ body: createSentenceSchema }),
  SentenceController.create,
);
sentenceRoutes.post(
  '/ai',
  ...staff,
  validate({ body: generateContentSchema }),
  SentenceController.generate,
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

export { sentenceRoutes };
