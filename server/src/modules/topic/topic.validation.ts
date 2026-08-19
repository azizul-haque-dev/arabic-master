import { PAGINATION, VALIDATION } from "@/shared/constants.js";
import z from "zod";

export const createTopicSchema = z.object({
  titleEn: z
    .string()
    .trim()
    .min(VALIDATION.CATEGORY_NAME.MIN_LENGTH)
    .max(VALIDATION.CATEGORY_NAME.MAX_LENGTH),
  titleBn: z.string().trim().max(VALIDATION.CATEGORY_NAME.MAX_LENGTH),
});

export const updateTopicSchema = createTopicSchema.partial();
export const topicIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listTopicSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
  search: z.string().trim().optional(),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type ListTopicQuery = z.infer<typeof listTopicSchema>;
