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
    .describe(
      'Practical pronunciation spelling in Bangla script only for Bangla speakers; do not include Arabic text or Latin transliteration',
    ),
  pronunciationEn: z
    .string()
    .describe(
      'Practical pronunciation transliteration using English/Latin letters only; do not include Arabic text or Bangla script',
    ),
  feminineBn: z
    .string()
    .describe(
      'Feminine pronunciation in Bangla script only; do not include Arabic text, Latin transliteration, or explanations. If identical to male, exactly return: ছেলে এবং মেয়ে উভয়ের জন্য একই রূপ',
    ),
  feminineEn: z
    .string()
    .describe(
      'Feminine pronunciation using English/Latin letters only; do not include Arabic text, Bangla script, or explanations. If identical to male, exactly return: Same for both genders',
    ),
  whenToUseBn: z
    .string()
    .describe(
      'Detailed context in Bangla describing simply and naturally when and why the expression is used. If the expression is commonly used as a reply, say so and name its common Arabic trigger word, phrase, or question with Bangla-script pronunciation; do not invent uncertain triggers. Do not mention or compare dialects, regions, countries, or nationalities. Refer to people as আরবরা.',
    ),
  whenToUseEn: z
    .string()
    .describe(
      'Detailed context in English describing simply and naturally when and why the expression is used. If the expression is commonly used as a reply, say so and name its common Arabic trigger word, phrase, or question with Latin-letter pronunciation; do not invent uncertain triggers. Do not mention or compare dialects, regions, countries, or nationalities. Refer to people as Arabs.',
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
      'Concise Bangla usage context explaining simply and naturally when and why the expression is used. If the expression is commonly used as a reply, say so and name its common Arabic trigger word, phrase, or question with Bangla-script pronunciation; do not invent uncertain triggers. Do not mention or compare dialects, regions, countries, or nationalities. Use আরবরা.',
    ),
  whenToUseEn: z
    .string()
    .describe(
      'Concise English usage context explaining simply and naturally when and why the expression is used. If the expression is commonly used as a reply, say so and name its common Arabic trigger word, phrase, or question with Latin-letter pronunciation; do not invent uncertain triggers. Do not mention or compare dialects, regions, countries, or nationalities. Use Arabs.',
    ),
});
export type AiUsageContext = z.infer<typeof AIUsageContextSchema>;

export const AIBanglaPronunciationSchema = z.object({
  pronunciationBn: z
    .string()
    .trim()
    .min(1)
    .regex(/^[\u0980-\u09FF\s]+$/u, {
      message: 'Bangla pronunciation must use Bangla script only',
    })
    .describe(
      'Practical pronunciation using Bangla script only; represent Arabic س and ص with ছ',
    ),
});
export type AiBanglaPronunciation = z.infer<
  typeof AIBanglaPronunciationSchema
>;

export const SaudiArabicTranslationSchema = z.object({
  translatedText: z.string().min(1),
});
export type TranslateTextType = z.infer<typeof SaudiArabicTranslationSchema>;
