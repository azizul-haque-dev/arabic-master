import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./conversation.controller.js";
import {
  conversationIdParamSchema,
  createConversationSchema,
  listConversationsQuerySchema,
  updateConversationSchema,
} from "./conversation.validation.js";

const router = Router();

// Reading is public - conversations are learner-facing content.
router.get(
  "/",
  validate({ query: listConversationsQuerySchema }),
  controller.list,
);
router.get(
  "/:id",
  validate({ params: conversationIdParamSchema }),
  controller.getOne,
);

// Writes require an authenticated user.
router.post(
  "/",
  requireAuth,
  validate({ body: createConversationSchema }),
  controller.create,
);
router.patch(
  "/:id",
  requireAuth,
  validate({
    params: conversationIdParamSchema,
    body: updateConversationSchema,
  }),
  controller.update,
);
router.delete(
  "/:id",
  requireAuth,
  validate({ params: conversationIdParamSchema }),
  controller.remove,
);

export default router;
