import { Router } from 'express';
import { authenticate } from '../../../common/middleware/authenticate.js';
import { authorize } from '../../../common/middleware/authorize.js';
import { validate } from '../../../common/middleware/validate.js';
import {
  idParamSchema,
  reorderSchema,
  updateStatusSchema,
} from '../../../common/schemas.js';
import { Role } from '../../../database/drizzle/enums.js';
import { LessonController } from './lesson.controller.js';
import {
  addLessonItemSchema,
  createLessonSchema,
  itemParamSchema,
  listLessonQuerySchema,
  updateLessonSchema,
} from './lesson.schemas.js';

const lessonRoutes = Router();
const params = { params: idParamSchema };

lessonRoutes.use(authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN));
lessonRoutes.get(
  '/',
  validate({ query: listLessonQuerySchema }),
  LessonController.list,
);
lessonRoutes.get('/:id', validate(params), LessonController.getOne);
lessonRoutes.post(
  '/',
  validate({ body: createLessonSchema }),
  LessonController.create,
);
lessonRoutes.patch(
  '/:id',
  validate({ ...params, body: updateLessonSchema }),
  LessonController.update,
);
lessonRoutes.patch(
  '/:id/status',
  validate({ ...params, body: updateStatusSchema }),
  LessonController.changeStatus,
);

lessonRoutes.post(
  '/:id/items',
  validate({ ...params, body: addLessonItemSchema }),
  LessonController.addItem,
);
lessonRoutes.patch(
  '/:id/items/reorder',
  validate({ ...params, body: reorderSchema }),
  LessonController.reorderItems,
);
lessonRoutes.delete(
  '/:id/items/:itemId',
  validate({ params: itemParamSchema }),
  LessonController.removeItem,
);

lessonRoutes.delete(
  '/:id',
  authorize(Role.ADMIN),
  validate(params),
  LessonController.remove,
);

export { lessonRoutes };
