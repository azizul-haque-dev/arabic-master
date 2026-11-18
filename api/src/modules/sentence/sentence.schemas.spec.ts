import { describe, expect, it } from 'vitest';
import {
  createSentenceSchema,
  updateSentenceSchema,
} from './sentence.schemas.js';

const sentence = {
  text: 'شكراً',
  meaningEn: 'Thank you',
  meaningBn: 'ধন্যবাদ',
  whenToUseEn: 'To express gratitude.',
  whenToUseBn: 'কৃতজ্ঞতা জানাতে।',
  pronunciationEn: 'shukran',
  pronunciationBn: 'শুকরান',
  feminineEn: 'Same for both genders',
  feminineBn: 'ছেলে এবং মেয়ে উভয়ের জন্য একই রূপ',
  category: 'Greetings & Introductions',
};

describe('sentence schemas', () => {
  it('does not accept a separate reply-options field', () => {
    expect(
      createSentenceSchema.safeParse({
        ...sentence,
        replyOptions: [],
      }).success,
    ).toBe(false);
    expect(updateSentenceSchema.safeParse({ replyOptions: [] }).success).toBe(
      false,
    );
  });
});
