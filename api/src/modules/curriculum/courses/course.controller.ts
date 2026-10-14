import type { Request, Response } from 'express';
import { ok } from '../../../common/http/response.js';
import {
  bodyOf,
  paramsOf,
  queryOf,
} from '../../../common/middleware/validate.js';
import type { IdParam, UpdateStatusInput } from '../../../common/schemas.js';
import type {
  CreateCourseInput,
  ListCourseQuery,
  UpdateCourseInput,
} from './course.schemas.js';
import { CourseService } from './course.service.js';

const id = (req: Request) => paramsOf<IdParam>(req).id;

export const CourseController = {
  list: async (req: Request, res: Response) =>
    ok(res, await CourseService.list(queryOf<ListCourseQuery>(req))),
  getOne: async (req: Request, res: Response) =>
    ok(res, await CourseService.getById(id(req))),
  create: async (req: Request, res: Response) =>
    ok(
      res,
      await CourseService.create(bodyOf<CreateCourseInput>(req), req.auth!),
      201,
    ),
  update: async (req: Request, res: Response) =>
    ok(
      res,
      await CourseService.update(
        id(req),
        bodyOf<UpdateCourseInput>(req),
        req.auth!,
      ),
    ),
  changeStatus: async (req: Request, res: Response) =>
    ok(
      res,
      await CourseService.changeStatus(
        id(req),
        bodyOf<UpdateStatusInput>(req),
        req.auth!,
      ),
    ),
  remove: async (req: Request, res: Response) =>
    ok(res, await CourseService.remove(id(req))),
};

export type CourseController = typeof CourseController;
