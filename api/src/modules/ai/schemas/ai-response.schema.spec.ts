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
  whenToUseBn: 'কেউ "تسلم (তিসলাম)" বললে জবাবে এটি বলা হয়।',
  whenToUseEn: 'Say this in response to "تسلم (tislam)".',
  category: 'Greetings & Introductions',
};

describe('AIResponseSchema', () => {
  it('keeps reply-use information in the bilingual usage fields', () => {
    const parsed = AIResponseSchema.parse(response);

    expect(parsed.whenToUseEn).toContain('تسلم (tislam)');
    expect(parsed.whenToUseBn).toContain('تسلم (তিসলাম)');
  });
});

describe('createSaudiTeacherPrompt', () => {
  it('instructs the model to explain reply usage in the when-to-use text', () => {
    const prompt = createSaudiTeacherPrompt('تسلم');
    const systemMessage = prompt[0].content;

    expect(systemMessage).toContain('whenToUseEn');
    expect(systemMessage).toContain('whenToUseBn');
    expect(systemMessage).toContain('commonly used as a reply');
    expect(systemMessage).toContain('name the common word, phrase, or question');
    expect(systemMessage).not.toContain('replyOptions');
  });
});
