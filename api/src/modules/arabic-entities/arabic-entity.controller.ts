import type { Request, Response } from 'express';
import { BadRequestError } from '../../common/errors/app-error.js';
import { ok } from '../../common/http/response.js';
import { bodyOf, paramsOf, queryOf } from '../../common/middleware/validate.js';
import type { IdParam } from '../../common/schemas.js';
import type {
  AudioVariantQuery,
  CreateArabicEntityInput,
  ListArabicEntityQuery,
  UpdateArabicEntityInput,
  UpdateArabicEntityStatusInput,
} from './arabic-entity.schemas.js';
import { ArabicEntityService } from './arabic-entity.service.js';

const id = (req: Request) => paramsOf<IdParam>(req)?.id ?? req.params.id;

export const ArabicEntityController = {
  list: async (req: Request, res: Response) => {
    const query = queryOf<ListArabicEntityQuery>(req);
    const result = await ArabicEntityService.list(query);
    ok(res, result);
  },

  getOne: async (req: Request, res: Response) => {
    const entity = await ArabicEntityService.getById(id(req));
    ok(res, entity);
  },

  create: async (req: Request, res: Response) => {
    const body = bodyOf<CreateArabicEntityInput>(req);
    const created = await ArabicEntityService.create(body, req.auth!.userId);
    ok(res, created, 201);
  },

  update: async (req: Request, res: Response) => {
    const body = bodyOf<UpdateArabicEntityInput>(req);
    const updated = await ArabicEntityService.update(id(req), body, req.auth!);
    ok(res, updated);
  },

  updateStatus: async (req: Request, res: Response) => {
    const body = bodyOf<UpdateArabicEntityStatusInput>(req);
    const updated = await ArabicEntityService.updateStatus(
      id(req),
      body.status,
      body.rejectionReason,
      req.auth!,
    );
    ok(res, updated);
  },

  remove: async (req: Request, res: Response) => {
    await ArabicEntityService.remove(id(req), req.auth!);
    ok(res, null);
  },

  uploadAudio: async (req: Request, res: Response) => {
    if (!req.uploadedAudio) {
      throw new BadRequestError('No audio file was uploaded in the request.');
    }

    const targetId = id(req);
    const audioResource = await ArabicEntityService.uploadAudio(
      targetId,
      req.uploadedAudio,
      req.auth!,
    );

    ok(res, audioResource, 201);
  },

  getAudio: async (req: Request, res: Response) => {
    const targetId = id(req);
    const query = queryOf<AudioVariantQuery>(req);
    const variant = query?.variant ?? 'DEFAULT';
    const audio = await ArabicEntityService.getAudio(targetId, variant);
    ok(res, audio);
  },

  listAudios: async (req: Request, res: Response) => {
    const targetId = id(req);
    const audios = await ArabicEntityService.listAudios(targetId);
    ok(res, audios);
  },

  deleteAudio: async (req: Request, res: Response) => {
    const targetId = id(req);
    const query = queryOf<AudioVariantQuery>(req);
    const variant = query?.variant ?? 'DEFAULT';
    await ArabicEntityService.deleteAudio(targetId, variant, req.auth!);
    ok(res, null);
  },
};

export type ArabicEntityController = typeof ArabicEntityController;
