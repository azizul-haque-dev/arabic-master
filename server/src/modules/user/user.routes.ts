import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./user.controller.js";
import { updateProfileSchema } from "./user.validation.js";

const router = Router();

router.use(requireAuth); // every route below requires a logged-in user

router.get("/me", controller.getMe);
router.patch(
  "/me",
  validate({ body: updateProfileSchema }),
  controller.updateMe,
);

export default router;
