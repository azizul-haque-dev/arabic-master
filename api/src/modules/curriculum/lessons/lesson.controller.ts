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
  AddLessonWordsBatchInput,
  CreateLessonInput,
  ItemParam,
  ListLessonQuery,
  UpdateLessonInput,
} from './lesson.schemas.js';
import { LessonService } from './lesson.service.js';

const id = (req: Request) => paramsOf<IdParam>(req).id;

export const LessonController = {
  list: async (req: Request, res: Response) =>
    ok(res, await LessonService.list(queryOf<ListLessonQuery>(req))),
  getOne: async (req: Request, res: Response) =>
    ok(res, await LessonService.getById(id(req))),
  create: async (req: Request, res: Response) =>
    ok(
      res,
      await LessonService.create(bodyOf<CreateLessonInput>(req), req.auth!),
      201,
    ),
  update: async (req: Request, res: Response) =>
    ok(
      res,
      await LessonService.update(
        id(req),
        bodyOf<UpdateLessonInput>(req),
        req.auth!,
      ),
    ),
  changeStatus: async (req: Request, res: Response) =>
    ok(
      res,
      await LessonService.changeStatus(
        id(req),
        bodyOf<UpdateStatusInput>(req),
        req.auth!,
      ),
    ),
  /** route param `id` = sectionId (PATCH /sections/:id/lessons/reorder) */
  reorderInSection: async (req: Request, res: Response) =>
    ok(
      res,
      await LessonService.reorderInSection(
        id(req),
        bodyOf<ReorderInput>(req).ids,
        req.auth!,
      ),
    ),
  addItem: async (req: Request, res: Response) =>
    ok(
      res,
      await LessonService.addItem(
        id(req),
        bodyOf<AddLessonItemInput>(req),
        req.auth!,
      ),
      201,
    ),
  addWordsSmart: async (req: Request, res: Response) => {
    const input = bodyOf<AddLessonWordsBatchInput>(req);
    const result = await LessonService.addWordsSmart(
      id(req),
      input.words,
      req.auth!,
    );
    ok(res, result, 200);
  },
  reorderItems: async (req: Request, res: Response) =>
    ok(
      res,
      await LessonService.reorderItems(
        id(req),
        bodyOf<ReorderInput>(req).ids,
        req.auth!,
      ),
    ),
  removeItem: async (req: Request, res: Response) => {
    const p = paramsOf<ItemParam>(req);
    ok(res, await LessonService.removeItem(p.id, p.itemId, req.auth!));
  },
  remove: async (req: Request, res: Response) =>
    ok(res, await LessonService.remove(id(req))),
};

export type LessonController = typeof LessonController;
