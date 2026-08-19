import z from "zod";
import { categoryBnValues, categoryEnValues } from "./helper.js";

export const AIResponseSchema = z.object({
  text: z.string().describe("The exact Arabic word or expression"),

  categoryBn: z.enum(categoryBnValues),
  categoryEn: z.enum(categoryEnValues),

  meaningBn: z
    .string()
    .describe("Natural and conversational meaning in Bangla"),
  meaningEn: z
    .string()
    .describe("Natural and conversational meaning in English"),
  pronunciationBn: z
    .string()
    .describe("Practical pronunciation spelling for Bangla speakers"),
  pronunciationEn: z.string().describe("Practical English transliteration"),

  feminineBn: z
    .string()
    .describe(
      "Feminine form in Arabic with Bangla pronunciation. If identical to male, exactly return: ছেলে এবং মেয়ে উভয়ের জন্য একই রূপ",
    ),
  feminineEn: z
    .string()
    .describe(
      "Feminine form in Arabic with English pronunciation. If identical to male, exactly return:Same for both genders",
    ),
  whenToUseBn: z
    .string()
    .describe(
      "Detailed context of when Saudis use this in daily life in Bangla",
    ),
  whenToUseEn: z
    .string()
    .describe(
      "Detailed context of when Saudis use this in daily life in English",
    ),
});

export type AiResponse = z.infer<typeof AIResponseSchema>;

export const GenerateContentInputSchema = z
  .string()
  .trim()
  .min(1, "Query is required")
  .max(500, "Query is too long");

export const SaudiArabicTranslationSchema = z.object({
  traslatedText: z.string().min(1),
});

export type TrasnlateTextType = z.infer<typeof SaudiArabicTranslationSchema>;
