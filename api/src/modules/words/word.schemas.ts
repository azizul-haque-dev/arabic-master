import { z } from 'zod';
import { ALLOWED_CATEGORIES } from '../../common/constants/category.constant.js';
import { paginationShape } from '../../common/schemas.js';
import { contentStatusEnum, wordTypeEnum } from '../../database/drizzle/enums.js';

const text = z.string().min(1);
const category = z.enum(ALLOWED_CATEGORIES);

export const createWordSchema = z.strictObject({
  text,
  audioUrl: z.url().optional(),
  meaningEn: text, meaningBn: text,
  whenToUseEn: text, whenToUseBn: text,
  pronunciationEn: text, pronunciationBn: text,
  feminineEn: text, feminineBn: text,
  category,
  wordType: z.enum(wordTypeEnum.enumValues).optional(),
  noteEn: z.string().optional(),
  noteBn: z.string().optional(),
});
export const updateWordSchema = createWordSchema.partial();

export const listWordQuerySchema = z.strictObject({
  ...paginationShape,
  category: category.optional(),
  search: z.string().optional(),
  status: z.enum(contentStatusEnum.enumValues).optional(),
});

export type CreateWordInput = z.infer<typeof createWordSchema>;
export type UpdateWordInput = z.infer<typeof updateWordSchema>;
export type ListWordQuery = z.infer<typeof listWordQuerySchema>;
