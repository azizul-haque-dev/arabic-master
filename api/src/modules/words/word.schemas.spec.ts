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

const reply = {
  arabicText: 'الله يسلمك',
  pronunciationBn: 'আল্লাহ ইয়াসাল্লিমাক',
  pronunciationEn: 'allah yisallimak',
  meaningBn: 'আল্লাহ আপনাকে নিরাপদে রাখুন',
  meaningEn: 'May God keep you safe',
};

describe('createWordSchema reply options', () => {
  it('defaults legacy/manual word creation to no replies', () => {
    expect(createWordSchema.parse(word).replyOptions).toEqual([]);
  });

  it('does not clear replies when a partial update omits them', () => {
    expect(updateWordSchema.parse({ meaningEn: 'Thanks' })).not.toHaveProperty(
      'replyOptions',
    );
  });

  it('accepts up to three complete replies and rejects more', () => {
    expect(
      createWordSchema.parse({
        ...word,
        replyOptions: [reply, reply, reply],
      }).replyOptions,
    ).toHaveLength(3);
    expect(
      createWordSchema.safeParse({
        ...word,
        replyOptions: [reply, reply, reply, reply],
      }).success,
    ).toBe(false);
  });
});
