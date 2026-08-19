import { VALIDATION } from "@/shared/constants.js";
import z from "zod";
import { listTopicSchema } from "../topic/topic.validation.js";

export const createTopicConversationSchema = z.object({
  topicId: z.string().min(1),
  titleEn: z
    .string()
    .trim()
    .min(VALIDATION.CATEGORY_NAME.MIN_LENGTH)
    .max(VALIDATION.CATEGORY_NAME.MAX_LENGTH),
  titleBn: z
    .string()
    .trim()
    .max(VALIDATION.CATEGORY_NAME.MAX_LENGTH)
    .optional(),
});

export const updateTopicConversationSchema =
  createTopicConversationSchema.partial();
export const topicConversationIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listTopicConversationsQuerySchema = listTopicSchema.extend({
  topicId: z.string().optional(),
});

export type CreateTopicConversationInput = z.infer<
  typeof createTopicConversationSchema
>;
export type UpdateTopicConversationInput = z.infer<
  typeof updateTopicConversationSchema
>;
export type ListTopicConversationsQuery = z.infer<
  typeof listTopicConversationsQuerySchema
>;
