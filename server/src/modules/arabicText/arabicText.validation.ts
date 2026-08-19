import { GenerationStatus, Status } from "@/generated/prisma/enums.js";
import { VALIDATION } from "@/shared/constants.js";
import z from "zod";

export const createArabicTextSchema = z.object({
    text: z.string().trim().min(VALIDATION.ARABIC_TEXT.MIN_LENGTH, "Arabic text is required"),
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
    aiStatus: z.enum(GenerationStatus).optional()
});