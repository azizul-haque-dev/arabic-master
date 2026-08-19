import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./topic_conversation.controller.js";
import {
  createTopicConversationSchema,
  listTopicConversationsQuerySchema,
  topicConversationIdParamSchema,
  updateTopicConversationSchema,
} from "./topic_conversation.validation.js";

const router = Router();

// Reading is public - needed to browse conversations under a topic.
router.get(
  "/",
  validate({ query: listTopicConversationsQuerySchema }),
  controller.list,
);
router.get(
  "/:id",
  validate({ params: topicConversationIdParamSchema }),
  controller.getOne,
);

// Writes require an authenticated user.
router.post(
  "/",
  requireAuth,
  validate({ body: createTopicConversationSchema }),
  controller.create,
);
router.patch(
  "/:id",
  requireAuth,
  validate({
    params: topicConversationIdParamSchema,
    body: updateTopicConversationSchema,
  }),
  controller.update,
);
router.delete(
  "/:id",
  requireAuth,
  validate({ params: topicConversationIdParamSchema }),
  controller.remove,
);

export default router;
