import type { Request, Response } from 'express';
import { ok } from '../../common/http/response.js';
import { bodyOf, paramsOf, queryOf } from '../../common/middleware/validate.js';
import type { IdParam } from '../../common/schemas.js';
import type { GenerateContentInput } from '../ai/generate-content.schema.js';
import type {
  CreateWordInput,
  ListWordQuery,
  UpdateWordInput,
} from './word.schemas.js';
import { WordService } from './word.service.js';

const id = (req: Request) => paramsOf<IdParam>(req).id;

export const WordController = {
  list: async (req: Request, res: Response) =>
    ok(res, await WordService.list(queryOf<ListWordQuery>(req))),
  getOne: async (req: Request, res: Response) =>
    ok(res, await WordService.getById(id(req))),
  create: async (req: Request, res: Response) =>
    ok(
      res,
      await WordService.create(bodyOf<CreateWordInput>(req), req.auth!.userId),
      201,
    ),
  generate: async (req: Request, res: Response) =>
    ok(
      res,
      await WordService.generateWithAi(
        bodyOf<GenerateContentInput>(req).query,
        req.auth!.userId,
      ),
      202,
    ),
  update: async (req: Request, res: Response) =>
    ok(res, await WordService.update(id(req), bodyOf<UpdateWordInput>(req))),
  remove: async (req: Request, res: Response) => {
    await WordService.remove(id(req));
    ok(res, null);
  },
};

export type WordController = typeof WordController;

