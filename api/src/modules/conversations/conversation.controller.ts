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
import { ConversationService } from './conversation.service.js';

const id = (req: Request) => paramsOf<IdParam>(req).id;

export const ConversationController = {
  list: async (req: Request, res: Response) =>
    ok(res, await ConversationService.list(queryOf<ListConversationQuery>(req))),
  getOne: async (req: Request, res: Response) =>
    ok(res, await ConversationService.getById(id(req))),
  create: async (req: Request, res: Response) =>
    ok(
      res,
      await ConversationService.create(
        bodyOf<CreateConversationInput>(req),
        req.auth!,
      ),
      201,
    ),
  update: async (req: Request, res: Response) =>
    ok(
      res,
      await ConversationService.update(
        id(req),
        bodyOf<UpdateConversationInput>(req),
        req.auth!,
      ),
    ),
  replaceTurns: async (req: Request, res: Response) =>
    ok(
      res,
      await ConversationService.replaceTurns(
        id(req),
        bodyOf<ReplaceTurnsInput>(req),
        req.auth!,
      ),
    ),
  changeStatus: async (req: Request, res: Response) =>
    ok(
      res,
      await ConversationService.changeStatus(
        id(req),
        bodyOf<UpdateStatusInput>(req),
        req.auth!,
      ),
    ),
  remove: async (req: Request, res: Response) =>
    ok(res, await ConversationService.remove(id(req))),
};

export type ConversationController = typeof ConversationController;
