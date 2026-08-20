import { GenerationStatus, Status } from "@/generated/prisma/enums.js";
import { PAGINATION, VALIDATION } from "@/shared/constants.js";
import z from "zod";

export const createArabicTextSchema = z.object({
    text: z
        .string()
        .trim()
        .min(VALIDATION.ARABIC_TEXT.MIN_LENGTH, "Arabic text is required"),
    audioUrl: z.string().url().optional(),
    pronunciationEn: z.string().trim().optional(),
    pronunciationBn: z.string().trim().optional(),
    meaningEn: z.string().trim().optional(),
    meaningBn: z.string().trim().optional(),
    whenToUseEn: z.string().trim().optional(),
    whenToUseBn: z.string().trim().optional(),
    feminineEn: z.string().trim().optional(),
    feminineBn: z.string().trim().optional(),
    status: z.enum(Status).optional(),
    aiStatus: z.enum(GenerationStatus).optional(),
});

export const updateArabicTextSchema = createArabicTextSchema.partial();

export const arabicTextIdParamSchema = z.object({
    id: z.string().min(1),
});

export const listArabicTextsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(PAGINATION.DEFAULT_PAGE),
    limit: z.coerce
        .number()
        .int()
        .positive()
        .max(PAGINATION.MAX_LIMIT)
        .default(PAGINATION.DEFAULT_LIMIT),
    status: z.enum(Status).optional(),
    aiStatus: z.enum(GenerationStatus).optional(),
    search: z.string().trim().optional(),
});

// Input for POST /arabic-texts/ai - raw text gets queued for AI enrichment.
// Only `text` is accepted here; everything else is filled in by the worker.
export const generateArabicTextSchema = z.object({
    text: z
        .string()
        .trim()
        .min(VALIDATION.ARABIC_TEXT.MIN_LENGTH, "Arabic text is required"),
});