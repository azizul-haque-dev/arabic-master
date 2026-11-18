import { describe, expect, it } from 'vitest';
import { createSaudiTeacherPrompt } from '../prompts/prompt.factory.js';
import { AIResponseSchema } from './ai-response.schema.js';

const response = {
  text: 'تسلم',
  meaningBn: 'ধন্যবাদ',
  meaningEn: 'Thank you',
  pronunciationBn: 'তিসলাম',
  pronunciationEn: 'tislam',
  feminineBn: 'ছেলে এবং মেয়ে উভয়ের জন্য একই রূপ',
  feminineEn: 'Same for both genders',
  whenToUseBn: 'কেউ সাহায্য করলে কৃতজ্ঞতা জানাতে বলা হয়।',
  whenToUseEn: 'A casual way to thank someone for their help.',
  category: 'Greetings & Introductions',
  replyOptions: [
    {
      arabicText: 'الله يسلمك',
      pronunciationBn: 'আল্লাহ ইয়াসাল্লিমাক',
      pronunciationEn: 'allah yisallimak',
      meaningBn: 'আল্লাহ আপনাকে নিরাপদে রাখুন',
      meaningEn: 'May God keep you safe',
    },
  ],
};

describe('AIResponseSchema', () => {
  it('accepts a generated conversational reply', () => {
    expect(AIResponseSchema.parse(response).replyOptions).toEqual(
      response.replyOptions,
    );
  });

  it('requires replyOptions and limits alternatives to three', () => {
    const { replyOptions: _replyOptions, ...withoutReplies } = response;
    expect(AIResponseSchema.safeParse(withoutReplies).success).toBe(false);
    expect(
      AIResponseSchema.safeParse({
        ...response,
        replyOptions: Array.from({ length: 4 }, () => response.replyOptions[0]),
      }).success,
    ).toBe(false);
  });

  it('allows an empty list when no conversational reply applies', () => {
    expect(
      AIResponseSchema.parse({ ...response, replyOptions: [] }).replyOptions,
    ).toEqual([]);
  });
});

describe('createSaudiTeacherPrompt', () => {
  it('instructs the model to generate relevant replies with the expected example', () => {
    const prompt = createSaudiTeacherPrompt('تسلم');
    const systemMessage = prompt[0].content;

    expect(systemMessage).toContain('replyOptions array');
    expect(systemMessage).toContain('تسلم');
    expect(systemMessage).toContain('الله يسلمك');
    expect(systemMessage).toContain('empty array');
  });
});
