import { describe, expect, it } from 'vitest';
import { DEFAULT_CATEGORY } from '../../common/constants/category.constant.js';
import type { AiResponse } from './schemas/ai-response.schema.js';
import { assertAiOutputLabelsAllowed } from './output-policy.js';

const validResponse: AiResponse = {
  text: 'مرحبا',
  meaningBn: 'একটি সাধারণ অভিবাদন',
  meaningEn: 'A common greeting',
  pronunciationBn: 'মারহাবা',
  pronunciationEn: 'Marhaba',
  feminineBn: 'ছেলে এবং মেয়ে উভয়ের জন্য একই রূপ',
  feminineEn: 'Same for both genders',
  whenToUseBn: 'আরবরা নাজদি ও হিজাজি—দুই উপভাষাতেই এটি ব্যবহার করেন।',
  whenToUseEn: 'Arabs use this in both Najdi and Hijazi dialects.',
  category: DEFAULT_CATEGORY,
  noteEn: 'Usage is shared across both dialects.',
  noteBn: 'দুই উপভাষাতেই ব্যবহারটি প্রচলিত।',
};

describe('assertAiOutputLabelsAllowed', () => {
  it('accepts generic Arab wording and Najdi/Hijazi usage notes', () => {
    expect(() => assertAiOutputLabelsAllowed(validResponse)).not.toThrow();
  });

  it.each([
    ['Saudi', 'Saudi speakers use this phrase.'],
    ['Saudis', 'Saudis use this phrase.'],
    ['Saudi Arabia', 'This phrase is used in Saudi Arabia.'],
    ['Saudi Arabian', 'A Saudi Arabian expression.'],
    ['Bangla সৌদি', 'সৌদি আরবের মানুষ এটি ব্যবহার করেন।'],
    ['Bangla সৌদি আরব', 'সৌদি-আরবের মানুষ এটি ব্যবহার করেন।'],
  ])('rejects prohibited label: %s', (_label, whenToUseEn) => {
    expect(() =>
      assertAiOutputLabelsAllowed({
        ...validResponse,
        whenToUseEn,
      }),
    ).toThrow(/whenToUseEn/);
  });

  it('checks explanatory and pronunciation fields as well as usage context', () => {
    expect(() =>
      assertAiOutputLabelsAllowed({
        ...validResponse,
        meaningBn: 'সৌদি শব্দের অর্থ',
      }),
    ).toThrow(/meaningBn/);
  });
});
