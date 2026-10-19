import type { Request, Response } from 'express';
import { BadRequestError } from '../../common/errors/app-error.js';
import { ok } from '../../common/http/response.js';
import { paramsOf, queryOf } from '../../common/middleware/validate.js';
import type { IdParam } from '../../common/schemas.js';
import type { AudioVariantQuery } from './arabic-entity.schemas.js';
import { ArabicEntityService } from './arabic-entity.service.js';

const id = (req: Request) => paramsOf<IdParam>(req).id;

export const ArabicEntityController = {
  getOne: async (req: Request, res: Response) => {
    const entity = await ArabicEntityService.resolveEntity(id(req));
    ok(res, entity);
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
