import type { Request, Response } from 'express';
import { ok } from '../../common/http/response.js';
import { bodyOf, paramsOf, queryOf } from '../../common/middleware/validate.js';
import type { IdParam, UpdateStatusInput } from '../../common/schemas.js';
import type {
  CreateConversationInput,
  ListConversationQuery,
  ReplaceTurnsInput,
  UpdateConversationInput,
} from './conversation.schemas.js';
import type { ConversationService } from './conversation.service.js';

export function createConversationController(service: ConversationService) {
  const id = (req: Request) => paramsOf<IdParam>(req).id;
  return {
    list: async (req: Request, res: Response) =>
      ok(res, await service.list(queryOf<ListConversationQuery>(req))),
    getOne: async (req: Request, res: Response) =>
      ok(res, await service.getById(id(req))),
    create: async (req: Request, res: Response) =>
      ok(
        res,
        await service.create(bodyOf<CreateConversationInput>(req), req.auth!),
        201,
      ),
    update: async (req: Request, res: Response) =>
      ok(
        res,
        await service.update(
          id(req),
          bodyOf<UpdateConversationInput>(req),
          req.auth!,
        ),
      ),
    replaceTurns: async (req: Request, res: Response) =>
      ok(
        res,
        await service.replaceTurns(
          id(req),
          bodyOf<ReplaceTurnsInput>(req),
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
    remove: async (req: Request, res: Response) =>
      ok(res, await service.remove(id(req))),
  };
}
export type ConversationController = ReturnType<
  typeof createConversationController
>;
