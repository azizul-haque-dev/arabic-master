// Mounts every module's router under a single /api/v1 prefix.
import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import categoryRoutes from "../modules/category/category.routes.js";
import mediaRoutes from "../modules/media/media.routes.js";
import sentenceRoutes from "../modules/sentence/sentence.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import wordRoutes from "../modules/word/word.routes.js";
import { sendSuccess } from "@/lib/api-response.js";

const router = Router();

router.get("/health", (_req, res) =>
  sendSuccess(res, 200, "OK", { timestamp: new Date().toISOString() }),
);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/words", wordRoutes);
router.use("/sentences", sentenceRoutes);
router.use("/media", mediaRoutes);

export default router;
