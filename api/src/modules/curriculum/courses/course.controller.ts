import type { Request, Response } from 'express';
import { ok } from '../../../common/http/response.js';
import { bodyOf, paramsOf, queryOf } from '../../../common/middleware/validate.js';
import type { IdParam, UpdateStatusInput } from '../../../common/schemas.js';
import type { CreateCourseInput, ListCourseQuery, UpdateCourseInput } from './course.schemas.js';
import type { CourseService } from './course.service.js';

export function createCourseController(service: CourseService) {
  const id = (req: Request) => paramsOf<IdParam>(req).id;
  return {
    list: async (req: Request, res: Response) => ok(res, await service.list(queryOf<ListCourseQuery>(req))),
    getOne: async (req: Request, res: Response) => ok(res, await service.getById(id(req))),
    create: async (req: Request, res: Response) => ok(res, await service.create(bodyOf<CreateCourseInput>(req), req.auth!), 201),
    update: async (req: Request, res: Response) => ok(res, await service.update(id(req), bodyOf<UpdateCourseInput>(req), req.auth!)),
    changeStatus: async (req: Request, res: Response) => ok(res, await service.changeStatus(id(req), bodyOf<UpdateStatusInput>(req), req.auth!)),
    remove: async (req: Request, res: Response) => ok(res, await service.remove(id(req))),
  };
}
export type CourseController = ReturnType<typeof createCourseController>;
