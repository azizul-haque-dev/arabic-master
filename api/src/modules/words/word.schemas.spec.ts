import { describe, expect, it } from 'vitest';
import { createWordSchema, updateWordSchema } from './word.schemas.js';

const word = {
  text: 'تسلم',
  meaningEn: 'Thank you',
  meaningBn: 'ধন্যবাদ',
  whenToUseEn: 'To thank someone.',
  whenToUseBn: 'কাউকে ধন্যবাদ জানাতে।',
  pronunciationEn: 'tislam',
  pronunciationBn: 'তিসলাম',
  feminineEn: 'Same for both genders',
  feminineBn: 'ছেলে এবং মেয়ে উভয়ের জন্য একই রূপ',
  category: 'Greetings & Introductions',
};

describe('word schemas', () => {
  it('does not accept a separate reply-options field', () => {
    expect(
      createWordSchema.safeParse({ ...word, replyOptions: [] }).success,
    ).toBe(false);
    expect(updateWordSchema.safeParse({ replyOptions: [] }).success).toBe(
      false,
    );
  });
});
