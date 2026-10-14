import { Router, type RequestHandler } from 'express';
import { authorize } from '../../../common/middleware/authorize.js';
import { validate } from '../../../common/middleware/validate.js';
import {
  idParamSchema,
  reorderSchema,
  updateStatusSchema,
} from '../../../common/schemas.js';
import { Role } from '../../../database/drizzle/enums.js';
import type { LessonController } from '../lessons/lesson.controller.js';
import type { SectionController } from './section.controller.js';
import {
  createSectionSchema,
  listSectionQuerySchema,
  updateSectionSchema,
} from './section.schemas.js';

export function createSectionRouter(d: {
  controller: SectionController;
  lessonController: LessonController;
  authenticate: RequestHandler;
}) {
  const r = Router();
  const c = d.controller;
  const params = { params: idParamSchema };

  r.use(d.authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN));
  r.get('/', validate({ query: listSectionQuerySchema }), c.list);
  r.get('/:id', validate(params), c.getOne);
  r.post('/', validate({ body: createSectionSchema }), c.create);
  r.patch('/:id', validate({ ...params, body: updateSectionSchema }), c.update);
  r.patch(
    '/:id/status',
    validate({ ...params, body: updateStatusSchema }),
    c.changeStatus,
  );
  // PATCH /sections/:sectionId/lessons/reorder
  r.patch(
    '/:id/lessons/reorder',
    validate({ ...params, body: reorderSchema }),
    d.lessonController.reorderInSection,
  );
  r.delete('/:id', authorize(Role.ADMIN), validate(params), c.remove);
  return r;
}
