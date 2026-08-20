import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./arabicText.controller.js";
import {
    arabicTextIdParamSchema,
    createArabicTextSchema,
    generateArabicTextSchema,
    listArabicTextsQuerySchema,
    updateArabicTextSchema,
} from "./arabicText.validation.js";

const router = Router();

// Reading is public - same policy as words/sentences/categories.
router.get(
    "/",
    validate({ query: listArabicTextsQuerySchema }),
    controller.list,
);
router.get(
    "/:id",
    validate({ params: arabicTextIdParamSchema }),
    controller.getOne,
);

// Writes require an authenticated user.
router.post(
    "/",
    requireAuth,
    validate({ body: createArabicTextSchema }),
    controller.create,
);
router.post(
    "/ai",
    requireAuth,
    validate({ body: generateArabicTextSchema }),
    controller.generate,
);
router.patch(
    "/:id",
    requireAuth,
    validate({ params: arabicTextIdParamSchema, body: updateArabicTextSchema }),
    controller.update,
);
router.delete(
    "/:id",
    requireAuth,
    validate({ params: arabicTextIdParamSchema }),
    controller.remove,
);

export default router;