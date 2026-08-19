import { validate } from "@/middlewares/validate.middleware.js";
import { Router } from "express";
import {
  createTopicSchema,
  listTopicSchema,
  topicIdParamSchema,
  updateTopicSchema,
} from "./topic.validation.js";

import { requireAuth } from "@/middlewares/auth.middleware.js";
import * as topicController from "./topic.controller.js";

// creating router
const router = Router();

// reading topics is public

router.get("/", validate({ query: listTopicSchema }), topicController.list);
router.get(
  "/:id",
  validate({ params: topicIdParamSchema }),
  topicController.getOne,
);

// writes require an authenticated user

router.post(
  "/",
  requireAuth,
  validate({ body: createTopicSchema }),
  topicController.create,
);

router.patch(
  "/:id",
  requireAuth,
  validate({ params: topicIdParamSchema, body: updateTopicSchema }),
  topicController.update,
);

router.delete(
  "/:id",
  requireAuth,
  validate({ params: topicIdParamSchema }),
  topicController.remove,
);
export { router as topicRoutes };
