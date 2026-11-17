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
      'Detailed context in Bangla describing practical use. If shared, say it is commonly used in both Najdi and Hijazi without inventing differences. If the taught form is Hijazi and Najdi differs, identify it as Hijazi and put the Najdi equivalent in square brackets. Refer to people as আরবরা, not by country or nationality.',
    ),
  whenToUseEn: z
    .string()
    .describe(
      'Detailed context in English describing practical use. If shared, say it is commonly used in both Najdi and Hijazi without inventing differences. If the taught form is Hijazi and Najdi differs, identify it as Hijazi and put the Najdi equivalent in square brackets. Refer to people as Arabs, not by country or nationality.',
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
      'Concise Bangla usage context. If shared, say it is commonly used in both Najdi and Hijazi. If the taught form is Hijazi and Najdi differs, identify the Hijazi form and put the Najdi equivalent in square brackets. Use আরবরা, not country or nationality labels.',
    ),
  whenToUseEn: z
    .string()
    .describe(
      'Concise English usage context. If shared, say it is commonly used in both Najdi and Hijazi. If the taught form is Hijazi and Najdi differs, identify the Hijazi form and put the Najdi equivalent in square brackets. Use Arabs, not country or nationality labels.',
    ),
});
export type AiUsageContext = z.infer<typeof AIUsageContextSchema>;

export const SaudiArabicTranslationSchema = z.object({
  translatedText: z.string().min(1),
});
export type TranslateTextType = z.infer<typeof SaudiArabicTranslationSchema>;
