import { Router } from "express";
import * as controller from "./category.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createCategorySchema, updateCategorySchema, categoryIdParamSchema } from "./category.validation";

const router = Router();

// Reading categories is public - they're needed to render filters/browse pages.
router.get("/", controller.list);
router.get("/:id", validate({ params: categoryIdParamSchema }), controller.getOne);

// Writes require an authenticated user.
router.post("/", requireAuth, validate({ body: createCategorySchema }), controller.create);
router.patch(
  "/:id",
  requireAuth,
  validate({ params: categoryIdParamSchema, body: updateCategorySchema }),
  controller.update
);
router.delete("/:id", requireAuth, validate({ params: categoryIdParamSchema }), controller.remove);

export default router;
