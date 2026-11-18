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

const reply = {
  arabicText: 'العفو',
  pronunciationBn: 'আল-আফও',
  pronunciationEn: 'al-afw',
  meaningBn: 'আপনাকে স্বাগতম',
  meaningEn: "You're welcome",
};

describe('createSentenceSchema reply options', () => {
  it('defaults legacy/manual sentence creation to no replies', () => {
    expect(createSentenceSchema.parse(sentence).replyOptions).toEqual([]);
  });

  it('does not clear replies when a partial update omits them', () => {
    expect(
      updateSentenceSchema.parse({ meaningEn: 'Thanks' }),
    ).not.toHaveProperty('replyOptions');
  });

  it('accepts up to three complete replies and rejects more', () => {
    expect(
      createSentenceSchema.parse({
        ...sentence,
        replyOptions: [reply, reply, reply],
      }).replyOptions,
    ).toHaveLength(3);
    expect(
      createSentenceSchema.safeParse({
        ...sentence,
        replyOptions: [reply, reply, reply, reply],
      }).success,
    ).toBe(false);
  });
});
