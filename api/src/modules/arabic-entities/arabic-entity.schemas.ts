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

export const listArabicEntityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  category: z.string().optional(),
  status: z
    .enum([
      'DRAFT',
      'IN_REVIEW',
      'APPROVED',
      'PUBLISHED',
      'REJECTED',
      'ARCHIVED',
    ])
    .optional(),
}).strip();
export type ListArabicEntityQuery = z.infer<typeof listArabicEntityQuerySchema>;

export const createArabicEntitySchema = z.strictObject({
  arabicText: z.string().trim().min(1, 'Arabic text is required'),
  meaningBangla: z.string().trim().optional(),
  meaningEnglish: z.string().trim().optional(),
  pronunciationBangla: z.string().trim().optional(),
  pronunciationEnglish: z.string().trim().optional(),
  audioUrl: z.string().trim().optional(),
  status: z
    .enum([
      'DRAFT',
      'IN_REVIEW',
      'APPROVED',
      'PUBLISHED',
      'REJECTED',
      'ARCHIVED',
    ])
    .default('DRAFT'),
});
export type CreateArabicEntityInput = z.infer<typeof createArabicEntitySchema>;

export const updateArabicEntitySchema = z.strictObject({
  arabicText: z.string().trim().min(1).optional(),
  meaningBangla: z.string().trim().optional(),
  meaningEnglish: z.string().trim().optional(),
  pronunciationBangla: z.string().trim().optional(),
  pronunciationEnglish: z.string().trim().optional(),
  audioUrl: z.string().trim().nullable().optional(),
  status: z
    .enum([
      'DRAFT',
      'IN_REVIEW',
      'APPROVED',
      'PUBLISHED',
      'REJECTED',
      'ARCHIVED',
    ])
    .optional(),
  rejectionReason: z.string().trim().max(1000).nullable().optional(),
});
export type UpdateArabicEntityInput = z.infer<typeof updateArabicEntitySchema>;

export const updateArabicEntityStatusSchema = z.strictObject({
  status: z.enum([
    'DRAFT',
    'IN_REVIEW',
    'APPROVED',
    'PUBLISHED',
    'REJECTED',
    'ARCHIVED',
  ]),
  rejectionReason: z.string().trim().max(1000).optional(),
});
export type UpdateArabicEntityStatusInput = z.infer<
  typeof updateArabicEntityStatusSchema
>;
