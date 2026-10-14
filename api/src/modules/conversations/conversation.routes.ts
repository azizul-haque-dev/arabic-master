import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.js';
import { authorize } from '../../common/middleware/authorize.js';
import { validate } from '../../common/middleware/validate.js';
import { idParamSchema, updateStatusSchema } from '../../common/schemas.js';
import { Role } from '../../database/drizzle/enums.js';
import { ConversationController } from './conversation.controller.js';
import {
  createConversationSchema,
  listConversationQuerySchema,
  replaceTurnsSchema,
  updateConversationSchema,
} from './conversation.schemas.js';

const conversationRoutes = Router();
const params = { params: idParamSchema };

conversationRoutes.use(authenticate, authorize(Role.CONTENT_MANAGER, Role.ADMIN)); // পুরো router-এর জন্য

conversationRoutes.get(
  '/',
  validate({ query: listConversationQuerySchema }),
  ConversationController.list,
);
conversationRoutes.get('/:id', validate(params), ConversationController.getOne);
conversationRoutes.post(
  '/',
  validate({ body: createConversationSchema }),
  ConversationController.create,
);
conversationRoutes.patch(
  '/:id',
  validate({ ...params, body: updateConversationSchema }),
  ConversationController.update,
);
conversationRoutes.put(
  '/:id/turns',
  validate({ ...params, body: replaceTurnsSchema }),
  ConversationController.replaceTurns,
);
conversationRoutes.patch(
  '/:id/status',
  validate({ ...params, body: updateStatusSchema }),
  ConversationController.changeStatus,
);
conversationRoutes.delete(
  '/:id',
  authorize(Role.ADMIN),
  validate(params),
  ConversationController.remove,
); // শুধু ADMIN

export { conversationRoutes };
