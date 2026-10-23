import { z } from 'zod';

const querySchema = z
  .string()
  .trim()
  .min(1, 'Query is required')
  .max(500, 'Query is too long');

export const generateContentSchema = z.strictObject({
  query: querySchema,
});
export type GenerateContentInput = z.infer<typeof generateContentSchema>;

export const generateWordListSchema = z.strictObject({
  query: z.array(querySchema).min(1).max(25),
});
export type GenerateWordListInput = z.infer<typeof generateWordListSchema>;
