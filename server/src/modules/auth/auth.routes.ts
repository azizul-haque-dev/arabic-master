import { Router } from "express";
import passport from "passport";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { authLimiter } from "../../middlewares/rate-limit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { sendError } from "@/lib/api-response.js";
import * as controller from "./auth.controller.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validation.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate({ body: registerSchema }),
  controller.register,
);
router.post(
  "/login",
  authLimiter,
  validate({ body: loginSchema }),
  controller.login,
);
router.post("/refresh", controller.refresh);
router.post("/logout", requireAuth, controller.logout);

router.post(
  "/verify-email",
  validate({ body: verifyEmailSchema }),
  controller.verifyEmail,
);
router.post(
  "/forgot-password",
  authLimiter,
  validate({ body: forgotPasswordSchema }),
  controller.forgotPassword,
);
router.post(
  "/reset-password",
  validate({ body: resetPasswordSchema }),
  controller.resetPassword,
);

// Google OAuth - only functional when GOOGLE_* env vars are configured.
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/v1/auth/google/failure",
  }),
  controller.googleCallback,
);
router.get("/google/failure", (_req, res) =>
  sendError(res, 401, "Google authentication failed"),
);

export default router;
