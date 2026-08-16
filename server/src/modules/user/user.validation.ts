import { VALIDATION } from "@/shared/constants.js";
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(VALIDATION.NAME.MIN_LENGTH).max(VALIDATION.NAME.MAX_LENGTH).optional(),
  avatarUrl: z.string().url().optional(),
});
