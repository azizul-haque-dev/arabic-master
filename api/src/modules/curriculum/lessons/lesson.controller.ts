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
  AddLessonItemInput,
  CreateLessonInput,
  ItemParam,
  ListLessonQuery,
  UpdateLessonInput,
} from './lesson.schemas.js';
import type { LessonService } from './lesson.service.js';

export function createLessonController(service: LessonService) {
  const id = (req: Request) => paramsOf<IdParam>(req).id;
  return {
    list: async (req: Request, res: Response) =>
      ok(res, await service.list(queryOf<ListLessonQuery>(req))),
    getOne: async (req: Request, res: Response) =>
      ok(res, await service.getById(id(req))),
    create: async (req: Request, res: Response) =>
      ok(
        res,
        await service.create(bodyOf<CreateLessonInput>(req), req.auth!),
        201,
      ),
    update: async (req: Request, res: Response) =>
      ok(
        res,
        await service.update(
          id(req),
          bodyOf<UpdateLessonInput>(req),
          req.auth!,
        ),
      ),
    changeStatus: async (req: Request, res: Response) =>
      ok(
        res,
        await service.changeStatus(
          id(req),
          bodyOf<UpdateStatusInput>(req),
          req.auth!,
        ),
      ),
    /** route param `id` = sectionId (PATCH /sections/:id/lessons/reorder) */
    reorderInSection: async (req: Request, res: Response) =>
      ok(
        res,
        await service.reorderInSection(
          id(req),
          bodyOf<ReorderInput>(req).ids,
          req.auth!,
        ),
      ),
    addItem: async (req: Request, res: Response) =>
      ok(
        res,
        await service.addItem(
          id(req),
          bodyOf<AddLessonItemInput>(req),
          req.auth!,
        ),
        201,
      ),
    reorderItems: async (req: Request, res: Response) =>
      ok(
        res,
        await service.reorderItems(
          id(req),
          bodyOf<ReorderInput>(req).ids,
          req.auth!,
        ),
      ),
    removeItem: async (req: Request, res: Response) => {
      const p = paramsOf<ItemParam>(req);
      ok(res, await service.removeItem(p.id, p.itemId, req.auth!));
    },
    remove: async (req: Request, res: Response) =>
      ok(res, await service.remove(id(req))),
  };
}
export type LessonController = ReturnType<typeof createLessonController>;
