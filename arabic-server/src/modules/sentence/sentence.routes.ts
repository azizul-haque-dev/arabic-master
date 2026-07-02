import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./sentence.controller.js";
import {
  createSentenceSchema,
  listSentencesQuerySchema,
  sentenceIdParamSchema,
  updateSentenceSchema,
} from "./sentence.validation.js";

const router = Router();

router.get("/", validate({ query: listSentencesQuerySchema }), controller.list);
router.get(
  "/:id",
  validate({ params: sentenceIdParamSchema }),
  controller.getOne,
);

router.post(
  "/",
  requireAuth,
  validate({ body: createSentenceSchema }),
  controller.create,
);
router.patch(
  "/:id",
  requireAuth,
  validate({ params: sentenceIdParamSchema, body: updateSentenceSchema }),
  controller.update,
);
router.delete(
  "/:id",
  requireAuth,
  validate({ params: sentenceIdParamSchema }),
  controller.remove,
);

export default router;
