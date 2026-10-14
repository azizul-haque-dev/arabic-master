import type { Request, Response } from 'express';
import { ok } from '../../common/http/response.js';
import { bodyOf, paramsOf, queryOf } from '../../common/middleware/validate.js';
import type { IdParam } from '../../common/schemas.js';
import type { GenerateContentInput } from '../ai/generate-content.schema.js';
import type {
  CreateSentenceInput,
  ListSentenceQuery,
  UpdateSentenceInput,
} from './sentence.schemas.js';
import { SentenceService } from './sentence.service.js';

const id = (req: Request) => paramsOf<IdParam>(req).id;

export const SentenceController = {
  list: async (req: Request, res: Response) =>
    ok(res, await SentenceService.list(queryOf<ListSentenceQuery>(req))),
  getOne: async (req: Request, res: Response) =>
    ok(res, await SentenceService.getById(id(req))),
  create: async (req: Request, res: Response) =>
    ok(
      res,
      await SentenceService.create(
        bodyOf<CreateSentenceInput>(req),
        req.auth!.userId,
      ),
      201,
    ),
  generate: async (req: Request, res: Response) =>
    ok(
      res,
      await SentenceService.generateWithAi(
        bodyOf<GenerateContentInput>(req).query,
        req.auth!.userId,
      ),
      202,
    ),
  resyncWords: async (req: Request, res: Response) =>
    ok(res, await SentenceService.resyncWords(id(req)), 202),
  update: async (req: Request, res: Response) =>
    ok(
      res,
      await SentenceService.update(id(req), bodyOf<UpdateSentenceInput>(req)),
    ),
  remove: async (req: Request, res: Response) => {
    await SentenceService.remove(id(req));
    ok(res, null);
  },
};

export type SentenceController = typeof SentenceController;
