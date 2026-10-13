import { Router, type RequestHandler } from 'express';
import { authorize } from '../../common/middleware/authorize.js';
import { validate } from '../../common/middleware/validate.js';
import { idParamSchema } from '../../common/schemas.js';
import { Role } from '../../database/drizzle/enums.js';
import { generateContentSchema } from '../ai/generate-content.schema.js';
import type { WordController } from './word.controller.js';
import { createWordSchema, listWordQuerySchema, updateWordSchema } from './word.schemas.js';

export function createWordRouter(d: { controller: WordController; authenticate: RequestHandler }) {
  const r = Router();
  const c = d.controller;
  const staff = [d.authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN)];
  const params = validate({ params: idParamSchema });

  r.get('/', d.authenticate, validate({ query: listWordQuerySchema }), c.list);
  // TODO(security): আগের মতোই public (পর্ব README #2)
  r.get('/:id', params, c.getOne);

  r.post('/', ...staff, validate({ body: createWordSchema }), c.create);
  r.post('/ai', ...staff, validate({ body: generateContentSchema }), c.generate);
  r.patch('/:id', ...staff, validate({ params: idParamSchema, body: updateWordSchema }), c.update);
  r.delete('/:id', ...staff, params, c.remove);
  return r;
}
