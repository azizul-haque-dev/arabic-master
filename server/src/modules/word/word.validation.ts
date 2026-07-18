import { Prisma } from "@/generated/prisma/client.js";
import { Status } from "@/generated/prisma/enums.js";
import { z } from "zod";

export const createWordSchema = z.object({
  text: z.string().trim().min(1, "Arabic text is required"),
  audioUrl: z.string().url().optional(),

  meaningEn: z.string().trim().optional(),
  meaningBn: z.string().trim().optional(),
  whenToUseEn: z.string().trim().optional(),
  whenToUseBn: z.string().trim().optional(),
  pronunciationEn: z.string().trim().optional(),
  pronunciationBn: z.string().trim().optional(),

  status: z.enum(Status).optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const updateWordSchema = createWordSchema.partial();

export const wordIdParamSchema = z.object({
  id: z.string().min(1),
});

export const listWordsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(Status).optional(),
  categoryId: z.string().optional(),
  search: z.string().trim().optional(), // matches against Arabic text or English meaning
});

export type ListWordsQuery = z.infer<typeof listWordsQuerySchema>;

export interface WordInput {
  text: string;
  audioUrl?: string;
  meaningEn?: string;
  meaningBn?: string;
  whenToUseEn?: string;
  whenToUseBn?: string;
  pronunciationEn?: string;
  pronunciationBn?: string;
  status?: Prisma.WordCreateInput["status"];
  categoryIds?: string[];
}
