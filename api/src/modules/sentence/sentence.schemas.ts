import { z } from 'zod';
import { ALLOWED_CATEGORIES } from '../../common/constants/category.constant.js';
import { paginationShape } from '../../common/schemas.js';
import { contentStatusEnum, difficultyLevelEnum } from '../../database/drizzle/enums.js';

const text = z.string().min(1);
const category = z.enum(ALLOWED_CATEGORIES);

export const createSentenceSchema = z.strictObject({
  text: text.describe('Arabic text'),
  audioUrl: z.url().optional(),
  meaningEn: text, meaningBn: text,
  whenToUseEn: text, whenToUseBn: text,
  pronunciationEn: text, pronunciationBn: text,
  feminineEn: text, feminineBn: text,
  category,
  difficulty: z.enum(difficultyLevelEnum.enumValues).optional(),
  relatedWordId: z.string().optional(),
  noteEn: z.string().optional(),
  noteBn: z.string().optional(),
  words: z.array(z.strictObject({ wordId: text, position: z.number().int().min(0) })).optional(),
});
export const updateSentenceSchema = createSentenceSchema.partial();

export const listSentenceQuerySchema = z.strictObject({
  ...paginationShape,
  category: category.optional(),
  search: z.string().optional(),
  status: z.enum(contentStatusEnum.enumValues).optional(),
});

export type CreateSentenceInput = z.infer<typeof createSentenceSchema>;
export type UpdateSentenceInput = z.infer<typeof updateSentenceSchema>;
export type ListSentenceQuery = z.infer<typeof listSentenceQuerySchema>;
