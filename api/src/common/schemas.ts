import { z } from 'zod';
import { PAGINATION } from '../config/constants.js';
import { contentStatusEnum } from '../database/drizzle/enums.js';

export const idParamSchema = z.strictObject({ id: z.string().min(1) });
export type IdParam = z.infer<typeof idParamSchema>;

export const paginationShape = {
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
};

export const updateStatusSchema = z.strictObject({
  status: z.enum(contentStatusEnum.enumValues),
  rejectionReason: z.string().max(500).optional(),
});
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

export const reorderSchema = z.strictObject({
  ids: z
    .array(z.string().min(1))
    .min(1)
    .max(500)
    .refine((a) => new Set(a).size === a.length, 'ids must be unique'),
});
export type ReorderInput = z.infer<typeof reorderSchema>;
