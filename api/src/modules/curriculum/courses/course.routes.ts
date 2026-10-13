import { Router, type RequestHandler } from 'express';
import { authorize } from '../../../common/middleware/authorize.js';
import { validate } from '../../../common/middleware/validate.js';
import { idParamSchema, reorderSchema, updateStatusSchema } from '../../../common/schemas.js';
import { Role } from '../../../database/drizzle/enums.js';
import type { SectionController } from '../sections/section.controller.js';
import type { CourseController } from './course.controller.js';
import { createCourseSchema, listCourseQuerySchema, updateCourseSchema } from './course.schemas.js';

export function createCourseRouter(d: {
  controller: CourseController; sectionController: SectionController; authenticate: RequestHandler;
}) {
  const r = Router();
  const c = d.controller;
  const params = { params: idParamSchema };

  r.use(d.authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN));
  r.get('/', validate({ query: listCourseQuerySchema }), c.list);
  r.get('/:id', validate(params), c.getOne);
  r.post('/', validate({ body: createCourseSchema }), c.create);
  r.patch('/:id', validate({ ...params, body: updateCourseSchema }), c.update);
  r.patch('/:id/status', validate({ ...params, body: updateStatusSchema }), c.changeStatus);
  // PATCH /courses/:courseId/sections/reorder
  r.patch('/:id/sections/reorder', validate({ ...params, body: reorderSchema }), d.sectionController.reorder);
  r.delete('/:id', authorize(Role.ADMIN), validate(params), c.remove);
  return r;
}
