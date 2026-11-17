import { z } from 'zod';
import { ALLOWED_CATEGORIES } from '../../../common/constants/category.constant.js';

export const AIResponseSchema = z.object({
  text: z.string().describe('The exact Arabic word or expression'),
  meaningBn: z
    .string()
    .describe('Natural and conversational meaning in Bangla'),
  meaningEn: z
    .string()
    .describe('Natural and conversational meaning in English'),
  pronunciationBn: z
    .string()
    .describe('Practical pronunciation spelling in Bangla for Bangla speakers'),
  pronunciationEn: z
    .string()
    .describe('Practical English pronunciation transliteration written in English'),
  feminineBn: z
    .string()
    .describe(
      'Feminine form in Arabic with Bangla pronunciation. If identical to male, exactly return: ছেলে এবং মেয়ে উভয়ের জন্য একই রূপ',
    ),
  feminineEn: z
    .string()
    .describe(
      'Feminine form in Arabic with English pronunciation. If identical to male, exactly return: Same for both genders',
    ),
  whenToUseBn: z
    .string()
    .describe(
      'Detailed context in Bangla describing simply and naturally when and why the expression is used. If it is commonly a reply to a word, phrase, or question, explain what it responds to; do not invent a trigger. Do not mention or compare dialects, regions, countries, or nationalities. Refer to people as আরবরা.',
    ),
  whenToUseEn: z
    .string()
    .describe(
      'Detailed context in English describing simply and naturally when and why the expression is used. If it is commonly a reply to a word, phrase, or question, explain what it responds to; do not invent a trigger. Do not mention or compare dialects, regions, countries, or nationalities. Refer to people as Arabs.',
    ),
  category: z
    .enum(ALLOWED_CATEGORIES)
    .describe('Best matching category for this word'),
  noteEn: z.string().optional().describe('Any additional notes in English'),
  noteBn: z.string().optional().describe('Any additional notes in Bangla'),
});
export type AiResponse = z.infer<typeof AIResponseSchema>;

export const AIUsageContextSchema = z.object({
  whenToUseBn: z
    .string()
    .describe(
      'Concise Bangla usage context explaining simply and naturally when and why the expression is used. If it commonly replies to a word, phrase, or question, explain what it responds to; do not invent a trigger. Do not mention or compare dialects, regions, countries, or nationalities. Use আরবরা.',
    ),
  whenToUseEn: z
    .string()
    .describe(
      'Concise English usage context explaining simply and naturally when and why the expression is used. If it commonly replies to a word, phrase, or question, explain what it responds to; do not invent a trigger. Do not mention or compare dialects, regions, countries, or nationalities. Use Arabs.',
    ),
});
export type AiUsageContext = z.infer<typeof AIUsageContextSchema>;

export const SaudiArabicTranslationSchema = z.object({
  translatedText: z.string().min(1),
});
export type TranslateTextType = z.infer<typeof SaudiArabicTranslationSchema>;
