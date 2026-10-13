import { Router, type RequestHandler } from 'express';
import { authorize } from '../../common/middleware/authorize.js';
import { validate } from '../../common/middleware/validate.js';
import { idParamSchema } from '../../common/schemas.js';
import { Role } from '../../database/drizzle/enums.js';
import { generateContentSchema } from '../ai/generate-content.schema.js';
import type { SentenceController } from './sentence.controller.js';
import { createSentenceSchema, listSentenceQuerySchema, updateSentenceSchema } from './sentence.schemas.js';

export function createSentenceRouter(d: { controller: SentenceController; authenticate: RequestHandler }) {
  const r = Router();
  const c = d.controller;
  const staff = [d.authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN)];
  const params = validate({ params: idParamSchema });

  // TODO(security): এই দুটো public। DRAFT/REJECTED sentence বাইরে যাচ্ছে (পর্ব ০ #2)। আগের আচরণ রাখা হয়েছে।
  r.get('/', validate({ query: listSentenceQuerySchema }), c.list);
  r.get('/:id', params, c.getOne);

  r.post('/', ...staff, validate({ body: createSentenceSchema }), c.create);
  r.post('/ai', ...staff, validate({ body: generateContentSchema }), c.generate);
  r.post('/:id/resync-words', ...staff, params, c.resyncWords);
  r.patch('/:id', ...staff, validate({ params: idParamSchema, body: updateSentenceSchema }), c.update);
  r.delete('/:id', ...staff, params, c.remove);
  return r;
}
