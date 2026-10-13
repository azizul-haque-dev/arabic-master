import type { Request, Response } from 'express';
import { ok } from '../../../common/http/response.js';
import { bodyOf, paramsOf, queryOf } from '../../../common/middleware/validate.js';
import type { IdParam, ReorderInput, UpdateStatusInput } from '../../../common/schemas.js';
import type { CreateSectionInput, ListSectionQuery, UpdateSectionInput } from './section.schemas.js';
import type { SectionService } from './section.service.js';

export function createSectionController(service: SectionService) {
  const id = (req: Request) => paramsOf<IdParam>(req).id;
  return {
    list: async (req: Request, res: Response) => ok(res, await service.list(queryOf<ListSectionQuery>(req))),
    getOne: async (req: Request, res: Response) => ok(res, await service.getById(id(req))),
    create: async (req: Request, res: Response) => ok(res, await service.create(bodyOf<CreateSectionInput>(req), req.auth!), 201),
    update: async (req: Request, res: Response) => ok(res, await service.update(id(req), bodyOf<UpdateSectionInput>(req), req.auth!)),
    changeStatus: async (req: Request, res: Response) => ok(res, await service.changeStatus(id(req), bodyOf<UpdateStatusInput>(req), req.auth!)),
    /** route param `id` = courseId (PATCH /courses/:id/sections/reorder) */
    reorder: async (req: Request, res: Response) => ok(res, await service.reorder(id(req), bodyOf<ReorderInput>(req).ids, req.auth!)),
    remove: async (req: Request, res: Response) => ok(res, await service.remove(id(req))),
  };
}
export type SectionController = ReturnType<typeof createSectionController>;
