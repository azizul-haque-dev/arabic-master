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
import type { WordService } from './word.service.js';

export function createWordController(service: WordService) {
  const id = (req: Request) => paramsOf<IdParam>(req).id;

  return {
    list: async (req: Request, res: Response) =>
      ok(res, await service.list(queryOf<ListWordQuery>(req))),
    getOne: async (req: Request, res: Response) =>
      ok(res, await service.getById(id(req))),
    create: async (req: Request, res: Response) =>
      ok(
        res,
        await service.create(bodyOf<CreateWordInput>(req), req.auth!.userId),
        201,
      ),
    generate: async (req: Request, res: Response) =>
      ok(
        res,
        await service.generateWithAi(
          bodyOf<GenerateContentInput>(req).query,
          req.auth!.userId,
        ),
        202,
      ),
    update: async (req: Request, res: Response) =>
      ok(res, await service.update(id(req), bodyOf<UpdateWordInput>(req))),
    remove: async (req: Request, res: Response) => {
      await service.remove(id(req));
      ok(res, null);
    },
  };
}

export type WordController = ReturnType<typeof createWordController>;
