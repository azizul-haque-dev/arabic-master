import { Router, type RequestHandler } from 'express';
import { authorize } from '../../../common/middleware/authorize.js';
import { validate } from '../../../common/middleware/validate.js';
import {
  idParamSchema,
  reorderSchema,
  updateStatusSchema,
} from '../../../common/schemas.js';
import { Role } from '../../../database/drizzle/enums.js';
import type { LessonController } from './lesson.controller.js';
import {
  addLessonItemSchema,
  createLessonSchema,
  itemParamSchema,
  listLessonQuerySchema,
  updateLessonSchema,
} from './lesson.schemas.js';

export function createLessonRouter(d: {
  controller: LessonController;
  authenticate: RequestHandler;
}) {
  const r = Router();
  const c = d.controller;
  const params = { params: idParamSchema };

  r.use(d.authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN));
  r.get('/', validate({ query: listLessonQuerySchema }), c.list);
  r.get('/:id', validate(params), c.getOne);
  r.post('/', validate({ body: createLessonSchema }), c.create);
  r.patch('/:id', validate({ ...params, body: updateLessonSchema }), c.update);
  r.patch(
    '/:id/status',
    validate({ ...params, body: updateStatusSchema }),
    c.changeStatus,
  );

  r.post(
    '/:id/items',
    validate({ ...params, body: addLessonItemSchema }),
    c.addItem,
  );
  r.patch(
    '/:id/items/reorder',
    validate({ ...params, body: reorderSchema }),
    c.reorderItems,
  );
  r.delete(
    '/:id/items/:itemId',
    validate({ params: itemParamSchema }),
    c.removeItem,
  );

  r.delete('/:id', authorize(Role.ADMIN), validate(params), c.remove);
  return r;
}
