import { z } from 'zod';
import { ALLOWED_CATEGORIES } from '../../common/constants/category.constant.js';
import { paginationShape } from '../../common/schemas.js';
import {
  contentStatusEnum,
  difficultyLevelEnum,
  sentenceTypeEnum,
} from '../../database/drizzle/enums.js';

const text = z.string().min(1);
const category = z.enum(ALLOWED_CATEGORIES);
const sentenceType = z.enum(sentenceTypeEnum.enumValues);
const aiQuery = z
  .string()
  .trim()
  .min(1, 'Query is required')
  .max(500, 'Query is too long');

export const createSentenceSchema = z.strictObject({
  text: text.describe('Arabic text'),
  audioUrl: z.url().optional(),
  meaningEn: text,
  meaningBn: text,
  whenToUseEn: text,
  whenToUseBn: text,
  pronunciationEn: text,
  pronunciationBn: text,
  feminineEn: text,
  feminineBn: text,
  category,
  sentenceType: sentenceType.optional(),
  difficulty: z.enum(difficultyLevelEnum.enumValues).optional(),
  relatedWordId: z.string().optional(),
  noteEn: z.string().optional(),
  noteBn: z.string().optional(),
  words: z
    .array(z.strictObject({ wordId: text, position: z.number().int().min(0) }))
    .optional(),
});
export const updateSentenceSchema = createSentenceSchema.extend({
  relatedWordId: z.string().nullable().optional(),
}).partial();

export const listSentenceQuerySchema = z.strictObject({
  ...paginationShape,
  category: category.optional(),
  search: z.string().optional(),
  status: z.enum(contentStatusEnum.enumValues).optional(),
  sentenceType: sentenceType.optional(),
  type: sentenceType.optional(),
});

export const generateSentenceAiSchema = z.strictObject({
  query: aiQuery,
  sentenceType: sentenceType.optional(),
  type: sentenceType.optional(),
  linkWords: z.boolean().optional(),
  relatedWordId: z.string().optional(),
});

export const generateSentenceListAiSchema = z.strictObject({
  query: z.array(aiQuery).min(1).max(25),
  sentenceType: sentenceType.optional(),
  type: sentenceType.optional(),
  linkWords: z.boolean().optional(),
  relatedWordId: z.string().optional(),
});

export type CreateSentenceInput = z.infer<typeof createSentenceSchema>;
export type UpdateSentenceInput = z.infer<typeof updateSentenceSchema>;
export type ListSentenceQuery = z.infer<typeof listSentenceQuerySchema>;
export type GenerateSentenceAiInput = z.infer<typeof generateSentenceAiSchema>;
export type GenerateSentenceListAiInput = z.infer<
  typeof generateSentenceListAiSchema
>;
