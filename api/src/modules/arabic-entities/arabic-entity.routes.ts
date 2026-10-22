import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { authorize } from '../../common/middleware/authorize.js';
import { parseAudioUpload } from '../../common/middleware/audio-upload.js';
import { validate } from '../../common/middleware/validate.js';
import { idParamSchema } from '../../common/schemas.js';
import { Role } from '../../database/drizzle/enums.js';
import { ArabicEntityController } from './arabic-entity.controller.js';
import {
  audioVariantQuerySchema,
  createArabicEntitySchema,
  listArabicEntityQuerySchema,
  updateArabicEntitySchema,
  updateArabicEntityStatusSchema,
} from './arabic-entity.schemas.js';

const arabicEntityRoutes = Router();
const staff = [authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN)];
const idParams = validate({ params: idParamSchema });

// List Arabic entities with pagination & search (GET /api/v1/arabic-entities)
arabicEntityRoutes.get(
  '/',
  authenticate,
  validate({ query: listArabicEntityQuerySchema }),
  ArabicEntityController.list,
);

// Create new Arabic entity (POST /api/v1/arabic-entities)
arabicEntityRoutes.post(
  '/',
  ...staff,
  validate({ body: createArabicEntitySchema }),
  ArabicEntityController.create,
);

// Upload audio for an Arabic entity (POST /api/v1/arabic-entities/:id/audio)
arabicEntityRoutes.post(
  '/:id/audio',
  ...staff,
  idParams,
  parseAudioUpload,
  ArabicEntityController.uploadAudio,
);

// Get audio metadata & playback URL for an Arabic entity (GET /api/v1/arabic-entities/:id/audio?variant=DEFAULT)
arabicEntityRoutes.get(
  '/:id/audio',
  authenticate,
  validate({ params: idParamSchema, query: audioVariantQuerySchema }),
  ArabicEntityController.getAudio,
);

// List all audio variants for an entity (GET /api/v1/arabic-entities/:id/audio/all)
arabicEntityRoutes.get(
  '/:id/audio/all',
  authenticate,
  idParams,
  ArabicEntityController.listAudios,
);

// Delete an audio variant (DELETE /api/v1/arabic-entities/:id/audio?variant=DEFAULT)
arabicEntityRoutes.delete(
  '/:id/audio',
  ...staff,
  validate({ params: idParamSchema, query: audioVariantQuerySchema }),
  ArabicEntityController.deleteAudio,
);

// Update status / workflow (PATCH /api/v1/arabic-entities/:id/status)
arabicEntityRoutes.patch(
  '/:id/status',
  ...staff,
  validate({ params: idParamSchema, body: updateArabicEntityStatusSchema }),
  ArabicEntityController.updateStatus,
);

// Update Arabic entity details (PATCH /api/v1/arabic-entities/:id)
arabicEntityRoutes.patch(
  '/:id',
  ...staff,
  validate({ params: idParamSchema, body: updateArabicEntitySchema }),
  ArabicEntityController.update,
);

// Delete Arabic entity (DELETE /api/v1/arabic-entities/:id)
arabicEntityRoutes.delete(
  '/:id',
  ...staff,
  idParams,
  ArabicEntityController.remove,
);

// Get Arabic entity by ID or entityKey (GET /api/v1/arabic-entities/:id)
arabicEntityRoutes.get('/:id', authenticate, idParams, ArabicEntityController.getOne);

export { arabicEntityRoutes };
