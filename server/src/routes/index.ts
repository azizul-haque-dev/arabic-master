// Mounts every module's router under a single /api/v1 prefix.
import { sendSuccess } from "@/lib/api-response.js";
import { topicRoutes } from "@/modules/topic/topic.route.js";
import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import categoryRoutes from "../modules/category/category.routes.js";
import conversationRoutes from "../modules/conversation/conversation.routes.js";
import conversationLineRoutes from "../modules/conversationLine/conversation_line.routes.js";
import mediaRoutes from "../modules/media/media.routes.js";
import sentenceRoutes from "../modules/sentence/sentence.routes.js";
import topicConversationRoutes from "../modules/topicConversation/topic_conversation.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import wordRoutes from "../modules/word/word.routes.js";
import arabicTextRoutes from "../modules/arabicText/arabicText.route.js";

const router = Router();

router.get("/health", (_req, res) =>
  sendSuccess(res, 200, "OK", { timestamp: new Date().toISOString() }),
);

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
