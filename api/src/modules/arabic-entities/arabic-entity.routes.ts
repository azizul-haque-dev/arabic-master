import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { authorize } from '../../common/middleware/authorize.js';
import { parseAudioUpload } from '../../common/middleware/audio-upload.js';
import { validate } from '../../common/middleware/validate.js';
import { idParamSchema } from '../../common/schemas.js';
import { Role } from '../../database/drizzle/enums.js';
import { ArabicEntityController } from './arabic-entity.controller.js';
import { audioVariantQuerySchema } from './arabic-entity.schemas.js';

const arabicEntityRoutes = Router();
const staff = [authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN)];
const idParams = validate({ params: idParamSchema });

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

// Get Arabic entity by ID or entityKey (GET /api/v1/arabic-entities/:id)
arabicEntityRoutes.get('/:id', authenticate, idParams, ArabicEntityController.getOne);

export { arabicEntityRoutes };
