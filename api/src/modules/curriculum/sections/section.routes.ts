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
import { LessonController } from '../lessons/lesson.controller.js';
import { SectionController } from './section.controller.js';
import {
  createSectionSchema,
  listSectionQuerySchema,
  updateSectionSchema,
} from './section.schemas.js';

const sectionRoutes = Router();
const params = { params: idParamSchema };

sectionRoutes.use(authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN));
sectionRoutes.get(
  '/',
  validate({ query: listSectionQuerySchema }),
  SectionController.list,
);
sectionRoutes.get('/:id', validate(params), SectionController.getOne);
sectionRoutes.post(
  '/',
  validate({ body: createSectionSchema }),
  SectionController.create,
);
sectionRoutes.patch(
  '/:id',
  validate({ ...params, body: updateSectionSchema }),
  SectionController.update,
);
sectionRoutes.patch(
  '/:id/status',
  validate({ ...params, body: updateStatusSchema }),
  SectionController.changeStatus,
);
// PATCH /sections/:sectionId/lessons/reorder
sectionRoutes.patch(
  '/:id/lessons/reorder',
  validate({ ...params, body: reorderSchema }),
  LessonController.reorderInSection,
);
sectionRoutes.delete(
  '/:id',
  authorize(Role.ADMIN),
  validate(params),
  SectionController.remove,
);

export { sectionRoutes };
