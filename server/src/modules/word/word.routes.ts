import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./word.controller.js";
import {
  arabicTextSchema,
  createWordSchema,
  listWordsQuerySchema,
  updateWordSchema,
  wordIdParamSchema,
} from "./word.validation.js";

const router = Router();

router.get(
  "/",
  validate({ query: listWordsQuerySchema }),
  requireAuth,
  controller.list,
);
router.get("/:id", validate({ params: wordIdParamSchema }), controller.getOne);

router.post(
  "/",
  requireAuth,
  validate({ body: createWordSchema }),
  controller.create,
);
router.post(
  "/ai",
  validate({ body: arabicTextSchema }),
  requireAuth,
  controller.processWord,
);
router.patch(
  "/:id",
  requireAuth,
  validate({ params: wordIdParamSchema, body: updateWordSchema }),
  controller.update,
);
router.delete(
  "/:id",
  requireAuth,
  validate({ params: wordIdParamSchema }),
  controller.remove,
);

export default router;
