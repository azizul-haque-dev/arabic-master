import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./conversation_line.controller.js";
import {
  conversationLineIdParamSchema,
  createConversationLineSchema,
  listConversationLinesQuerySchema,
  updateConversationLineSchema,
} from "./conversation_line.validation.js";

const router = Router();

router.get(
  "/",
  validate({ query: listConversationLinesQuerySchema }),
  controller.list,
);
router.get(
  "/:id",
  validate({ params: conversationLineIdParamSchema }),
  controller.getOne,
);

router.post(
  "/",
  requireAuth,
  validate({ body: createConversationLineSchema }),
  controller.create,
);
router.patch(
  "/:id",
  requireAuth,
  validate({
    params: conversationLineIdParamSchema,
    body: updateConversationLineSchema,
  }),
  controller.update,
);
router.delete(
  "/:id",
  requireAuth,
  validate({ params: conversationLineIdParamSchema }),
  controller.remove,
);

export default router;
