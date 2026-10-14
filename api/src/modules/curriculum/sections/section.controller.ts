import type { Request, Response } from 'express';
import { ok } from '../../../common/http/response.js';
import {
  bodyOf,
  paramsOf,
  queryOf,
} from '../../../common/middleware/validate.js';
import type {
  IdParam,
  ReorderInput,
  UpdateStatusInput,
} from '../../../common/schemas.js';
import type {
  CreateSectionInput,
  ListSectionQuery,
  UpdateSectionInput,
} from './section.schemas.js';
import { SectionService } from './section.service.js';

const id = (req: Request) => paramsOf<IdParam>(req).id;

export const SectionController = {
  list: async (req: Request, res: Response) =>
    ok(res, await SectionService.list(queryOf<ListSectionQuery>(req))),
  getOne: async (req: Request, res: Response) =>
    ok(res, await SectionService.getById(id(req))),
  create: async (req: Request, res: Response) =>
    ok(
      res,
      await SectionService.create(bodyOf<CreateSectionInput>(req), req.auth!),
      201,
    ),
  update: async (req: Request, res: Response) =>
    ok(
      res,
      await SectionService.update(
        id(req),
        bodyOf<UpdateSectionInput>(req),
        req.auth!,
      ),
    ),
  changeStatus: async (req: Request, res: Response) =>
    ok(
      res,
      await SectionService.changeStatus(
        id(req),
        bodyOf<UpdateStatusInput>(req),
        req.auth!,
      ),
    ),
  /** route param `id` = courseId (PATCH /courses/:id/sections/reorder) */
  reorder: async (req: Request, res: Response) =>
    ok(
      res,
      await SectionService.reorder(
        id(req),
        bodyOf<ReorderInput>(req).ids,
        req.auth!,
      ),
    ),
  remove: async (req: Request, res: Response) =>
    ok(res, await SectionService.remove(id(req))),
};

export type SectionController = typeof SectionController;
