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
import { SectionController } from '../sections/section.controller.js';
import { CourseController } from './course.controller.js';
import {
  createCourseSchema,
  listCourseQuerySchema,
  updateCourseSchema,
} from './course.schemas.js';

const courseRoutes = Router();
const params = { params: idParamSchema };

courseRoutes.use(authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN));
courseRoutes.get(
  '/',
  validate({ query: listCourseQuerySchema }),
  CourseController.list,
);
courseRoutes.get('/:id', validate(params), CourseController.getOne);
courseRoutes.post(
  '/',
  validate({ body: createCourseSchema }),
  CourseController.create,
);
courseRoutes.patch(
  '/:id',
  validate({ ...params, body: updateCourseSchema }),
  CourseController.update,
);
courseRoutes.patch(
  '/:id/status',
  validate({ ...params, body: updateStatusSchema }),
  CourseController.changeStatus,
);
// PATCH /courses/:courseId/sections/reorder
courseRoutes.patch(
  '/:id/sections/reorder',
  validate({ ...params, body: reorderSchema }),
  SectionController.reorder,
);
courseRoutes.delete(
  '/:id',
  authorize(Role.ADMIN),
  validate(params),
  CourseController.remove,
);

export { courseRoutes };
