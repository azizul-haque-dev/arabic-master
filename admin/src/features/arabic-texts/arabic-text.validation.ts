import z from "zod";

export const arabicTextSchema = z.object({
    text: z.string().trim().min(1, "Arabic text is required"),
    audioUrl: z
        .string()
        .trim()
        .url("Must be a valid URL")
        .optional()
        .or(z.literal("")),
    pronunciationEn: z.string().trim().optional(),
    pronunciationBn: z.string().trim().optional(),
    meaningEn: z.string().trim().optional(),
    meaningBn: z.string().trim().optional(),
    whenToUseEn: z.string().trim().optional(),
    whenToUseBn: z.string().trim().optional(),
    feminineEn: z.string().trim().optional(),
    feminineBn: z.string().trim().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ACTIVE", "DISABLED"]),
    aiStatus: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
});

export type ArabicTextValues = z.infer<typeof arabicTextSchema>;