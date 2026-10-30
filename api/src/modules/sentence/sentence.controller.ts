import type { Request, Response } from 'express';
import { ok } from '../../common/http/response.js';
import { bodyOf, paramsOf, queryOf } from '../../common/middleware/validate.js';
import type { IdParam } from '../../common/schemas.js';
import { SentenceType } from '../../database/drizzle/enums.js';
import type {
  CreateSentenceInput,
  GenerateSentenceAiInput,
  GenerateSentenceListAiInput,
  ListSentenceQuery,
  UpdateSentenceInput,
} from './sentence.schemas.js';
import { SentenceService } from './sentence.service.js';

const id = (req: Request) => paramsOf<IdParam>(req).id;

export const SentenceController = {
  list: async (req: Request, res: Response) =>
    ok(res, await SentenceService.list(queryOf<ListSentenceQuery>(req))),
  listShort: async (req: Request, res: Response) =>
    ok(res, await SentenceService.listShort(queryOf<ListSentenceQuery>(req))),
  listLong: async (req: Request, res: Response) =>
    ok(res, await SentenceService.listLong(queryOf<ListSentenceQuery>(req))),
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
  createShort: async (req: Request, res: Response) =>
    ok(
      res,
      await SentenceService.createShort(
        bodyOf<CreateSentenceInput>(req),
        req.auth!.userId,
      ),
      201,
    ),
  createLong: async (req: Request, res: Response) =>
    ok(
      res,
      await SentenceService.createLong(
        bodyOf<CreateSentenceInput>(req),
        req.auth!.userId,
      ),
      201,
    ),
  generate: async (req: Request, res: Response) => {
    const body = bodyOf<GenerateSentenceAiInput>(req);
    const sentenceType = body.sentenceType ?? body.type ?? SentenceType.LONG;
    ok(
      res,
      await SentenceService.generateWithAi(body.query, req.auth!.userId, {
        sentenceType,
        linkWords: body.linkWords,
        relatedWordId: body.relatedWordId,
      }),
      202,
    );
  },
  generateShort: async (req: Request, res: Response) => {
    const body = bodyOf<GenerateSentenceAiInput>(req);
    ok(
      res,
      await SentenceService.generateShortWithAi(body.query, req.auth!.userId, {
        linkWords: body.linkWords,
        relatedWordId: body.relatedWordId,
      }),
      202,
    );
  },
  generateLong: async (req: Request, res: Response) => {
    const body = bodyOf<GenerateSentenceAiInput>(req);
    ok(
      res,
      await SentenceService.generateLongWithAi(body.query, req.auth!.userId, {
        linkWords: body.linkWords,
        relatedWordId: body.relatedWordId,
      }),
      202,
    );
  },
  generateList: async (req: Request, res: Response) => {
    const body = bodyOf<GenerateSentenceListAiInput>(req);
    const sentenceType = body.sentenceType ?? body.type ?? SentenceType.LONG;
    ok(
      res,
      await SentenceService.generateManyWithAi(body.query, req.auth!.userId, {
        sentenceType,
        linkWords: body.linkWords,
        relatedWordId: body.relatedWordId,
      }),
      202,
    );
  },
  generateShortList: async (req: Request, res: Response) => {
    const body = bodyOf<GenerateSentenceListAiInput>(req);
    ok(
      res,
      await SentenceService.generateManyShortWithAi(
        body.query,
        req.auth!.userId,
        {
          linkWords: body.linkWords,
          relatedWordId: body.relatedWordId,
        },
      ),
      202,
    );
  },
  generateLongList: async (req: Request, res: Response) => {
    const body = bodyOf<GenerateSentenceListAiInput>(req);
    ok(
      res,
      await SentenceService.generateManyLongWithAi(
        body.query,
        req.auth!.userId,
        {
          linkWords: body.linkWords,
          relatedWordId: body.relatedWordId,
        },
      ),
      202,
    );
  },
  getAiJobStatus: async (req: Request, res: Response) =>
    ok(res, await SentenceService.getAiJobStatus(id(req))),
  regenerate: async (req: Request, res: Response) =>
    ok(
      res,
      await SentenceService.regenerateWithAi(id(req), req.auth?.userId),
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
