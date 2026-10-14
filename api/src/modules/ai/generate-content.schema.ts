import { z } from 'zod';
export const generateContentSchema = z.strictObject({
  query: z
    .string()
    .trim()
    .min(1, 'Query is required')
    .max(500, 'Query is too long'),
});
export type GenerateContentInput = z.infer<typeof generateContentSchema>;
