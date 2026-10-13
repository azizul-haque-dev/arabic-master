import { Router, type RequestHandler } from 'express';
import { authorize } from '../../common/middleware/authorize.js';
import { validate } from '../../common/middleware/validate.js';
import { idParamSchema, updateStatusSchema } from '../../common/schemas.js';
import { Role } from '../../database/drizzle/enums.js';
import type { ConversationController } from './conversation.controller.js';
import {
  createConversationSchema, listConversationQuerySchema, replaceTurnsSchema, updateConversationSchema,
} from './conversation.schemas.js';

export function createConversationRouter(d: { controller: ConversationController; authenticate: RequestHandler }) {
  const r = Router();
  const c = d.controller;
  const params = { params: idParamSchema };

  r.use(d.authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN)); // পুরো router-এর জন্য

  r.get('/', validate({ query: listConversationQuerySchema }), c.list);
  r.get('/:id', validate(params), c.getOne);
  r.post('/', validate({ body: createConversationSchema }), c.create);
  r.patch('/:id', validate({ ...params, body: updateConversationSchema }), c.update);
  r.put('/:id/turns', validate({ ...params, body: replaceTurnsSchema }), c.replaceTurns);
  r.patch('/:id/status', validate({ ...params, body: updateStatusSchema }), c.changeStatus);
  r.delete('/:id', authorize(Role.ADMIN), validate(params), c.remove); // শুধু ADMIN

  return r;
}
