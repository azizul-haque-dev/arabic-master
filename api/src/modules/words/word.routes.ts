import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { authorize } from '../../common/middleware/authorize.js';
import { validate } from '../../common/middleware/validate.js';
import { idParamSchema } from '../../common/schemas.js';
import { Role } from '../../database/drizzle/enums.js';
import {
  generateContentSchema,
  generateWordListSchema,
} from '../ai/generate-content.schema.js';
import { WordController } from './word.controller.js';
import {
  createWordSchema,
  listWordQuerySchema,
  updateWordSchema,
} from './word.schemas.js';

const wordRoutes = Router();
const staff = [authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN)];
const params = validate({ params: idParamSchema });

wordRoutes.get(
  '/',
  authenticate,
  validate({ query: listWordQuerySchema }),
  WordController.list,
);

wordRoutes.get('/:id', params, WordController.getOne);

wordRoutes.post(
  '/',
  ...staff,
  validate({ body: createWordSchema }),
  WordController.create,
);
wordRoutes.post(
  '/ai',
  ...staff,
  validate({ body: generateContentSchema }),
  WordController.generate,
);
wordRoutes.post(
  '/ai/list',
  ...staff,
  validate({ body: generateWordListSchema }),
  WordController.generateList,
);
wordRoutes.get('/ai/jobs/:id', ...staff, params, WordController.getAiJobStatus);
wordRoutes.patch(
  '/:id',
  ...staff,
  validate({ params: idParamSchema, body: updateWordSchema }),
  WordController.update,
);
wordRoutes.delete('/:id', ...staff, params, WordController.remove);

export { wordRoutes };
