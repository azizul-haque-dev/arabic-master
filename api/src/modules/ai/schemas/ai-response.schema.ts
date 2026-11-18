import { z } from 'zod';
import { ALLOWED_CATEGORIES } from '../../../common/constants/category.constant.js';
import { replyOptionSchema } from './reply-option.schema.js';

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
    .describe('Practical pronunciation spelling for Bangla speakers'),
  pronunciationEn: z.string().describe('Practical English transliteration'),
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
      'Detailed context of when Saudis use this in daily life in Bangla',
    ),
  whenToUseEn: z
    .string()
    .describe(
      'Detailed context of when Saudis use this in daily life in English',
    ),
  replyOptions: z
    .array(replyOptionSchema)
    .max(3)
    .describe(
      'Up to three natural Saudi Arabic replies to this expression when relevant; use an empty array when no natural conversational reply applies',
    ),
  category: z
    .enum(ALLOWED_CATEGORIES)
    .describe('Best matching category for this word'),
  noteEn: z.string().optional().describe('Any additional notes in English'),
  noteBn: z.string().optional().describe('Any additional notes in Bangla'),
});
export type AiResponse = z.infer<typeof AIResponseSchema>;

export const SaudiArabicTranslationSchema = z.object({
  translatedText: z.string().min(1),
});
export type TranslateTextType = z.infer<typeof SaudiArabicTranslationSchema>;
