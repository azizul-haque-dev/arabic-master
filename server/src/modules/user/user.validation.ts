import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  avatarUrl: z.string().url().optional(),
});
