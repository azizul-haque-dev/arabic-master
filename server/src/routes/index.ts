// Mounts every module's router under a single /api/v1 prefix.
import { invalidateCacheNamespace } from "@/integrations/cache.js";
import { sendSuccess } from "@/lib/api-response.js";
import { topicRoutes } from "@/modules/topic/topic.route.js";
import { Request, Response, Router } from "express";
import arabicTextRoutes from "../modules/arabicText/arabicText.route.js";
import authRoutes from "../modules/auth/auth.routes.js";
import categoryRoutes from "../modules/category/category.routes.js";
import conversationRoutes from "../modules/conversation/conversation.routes.js";
import conversationLineRoutes from "../modules/conversationLine/conversation_line.routes.js";
import mediaRoutes from "../modules/media/media.routes.js";
import sentenceRoutes from "../modules/sentence/sentence.routes.js";
import topicConversationRoutes from "../modules/topicConversation/topic_conversation.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import wordRoutes from "../modules/word/word.routes.js";

const router = Router();

router.get("/health", (_req, res) =>
  sendSuccess(res, 200, "OK", { timestamp: new Date().toISOString() }),
);
router.post("api/v1/clear-cache", async (req: Request, res: Response) => {
  try {
    const key = req.body.cacheKey as string;
    console.log({ key });
    await invalidateCacheNamespace(key);
    res
      .status(200)
      .json({ success: true, message: "Cache has been invalidate" });
  } catch {
    res.status(200).json({ success: true, message: "Internal server error" });
  }
});

router.use("/conversation-lines", conversationLineRoutes);

router.use("/topic-conversations", topicConversationRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/arabic-texts", arabicTextRoutes);
router.use("/words", wordRoutes);
router.use("/sentences", sentenceRoutes);
router.use("/media", mediaRoutes);
router.use("/topics", topicRoutes);
router.use("/conversations", conversationRoutes);

export default router;
