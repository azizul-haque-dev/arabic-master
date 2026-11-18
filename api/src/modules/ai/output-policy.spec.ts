import { describe, expect, it } from 'vitest';
import { DEFAULT_CATEGORY } from '../../common/constants/category.constant.js';
import type { AiResponse } from './schemas/ai-response.schema.js';
import {
  assertAiOutputLabelsAllowed,
  assertUsageContextLabelsAllowed,
} from './output-policy.js';

const validResponse: AiResponse = {
  text: 'مرحبا',
  meaningBn: 'একটি সাধারণ অভিবাদন',
  meaningEn: 'A common greeting',
  pronunciationBn: 'মারহাবা',
  pronunciationEn: 'Marhaba',
  feminineBn: 'ছেলে এবং মেয়ে উভয়ের জন্য একই রূপ',
  feminineEn: 'Same for both genders',
  whenToUseBn: 'আরবরা দৈনন্দিন জীবনে শুভেচ্ছা জানাতে এটি ব্যবহার করেন।',
  whenToUseEn: 'Arabs use this as a friendly everyday greeting.',
  category: DEFAULT_CATEGORY,
  replyOptions: [],
  noteEn: 'A warm and friendly expression.',
  noteBn: 'একটি আন্তরিক ও বন্ধুত্বপূর্ণ অভিব্যক্তি।',
};

describe('assertAiOutputLabelsAllowed', () => {
  it('accepts a simple, natural usage explanation', () => {
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

  it('checks learner-facing fields on generated reply options', () => {
    expect(() =>
      assertAiOutputLabelsAllowed({
        ...validResponse,
        replyOptions: [
          {
            arabicText: 'أهلاً',
            pronunciationBn: 'আহলান',
            pronunciationEn: 'ahlan',
            meaningBn: 'সৌদি অভিবাদন',
            meaningEn: 'A warm welcome',
          },
        ],
      }),
    ).toThrow(/replyOptions\[0\]\.meaningBn/);
  });

  it('rejects dialect and regional references in usage context', () => {
    expect(() =>
      assertAiOutputLabelsAllowed({
        ...validResponse,
        whenToUseEn: 'Arabs use it as a Hijazi greeting.',
      }),
    ).toThrow(/whenToUseEn/);

    expect(() =>
      assertUsageContextLabelsAllowed({
        whenToUseEn: 'Arabs use this as a warm greeting.',
        whenToUseBn: 'নাজদিতে আরবরা এটি ব্যবহার করেন।',
      }),
    ).toThrow(/whenToUseBn/);
  });

  it('rejects Saudi-related labels in focused usage-context results', () => {
    expect(() =>
      assertUsageContextLabelsAllowed({
        whenToUseEn: 'Saudi speakers use it in this setting.',
        whenToUseBn: 'আরবরা এই পরিস্থিতিতে এটি ব্যবহার করেন।',
      }),
    ).toThrow(/whenToUseEn/);

    expect(() =>
      assertUsageContextLabelsAllowed({
        whenToUseEn: 'Arabs use it in this setting.',
        whenToUseBn: 'সৌদি আরবের মানুষ এটি ব্যবহার করেন।',
      }),
    ).toThrow(/whenToUseBn/);
  });
});
