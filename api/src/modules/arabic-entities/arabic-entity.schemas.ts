import { z } from 'zod';

export const audioVariantQuerySchema = z.strictObject({
  variant: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{1,32}$/, 'Variant must be 1-32 alphanumeric characters, hyphens, or underscores')
    .default('DEFAULT'),
});
export type AudioVariantQuery = z.infer<typeof audioVariantQuerySchema>;

export const entityAudioParamSchema = z.strictObject({
  id: z.string().min(1),
  variant: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{1,32}$/)
    .optional(),
});
export type EntityAudioParam = z.infer<typeof entityAudioParamSchema>;
