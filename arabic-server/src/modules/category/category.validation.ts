import { z } from "zod";

export const createCategorySchema = z.object({
  nameEn: z.string().trim().min(1).max(120),
  nameBn: z.string().trim().min(1).max(120),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryIdParamSchema = z.object({
  id: z.string().min(1),
});
