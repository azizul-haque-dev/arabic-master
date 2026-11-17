import { describe, expect, it } from 'vitest';
import {
  createSaudiTeacherPrompt,
  createUsageContextPrompt,
  textToTranslateSaudiNativeArabic,
} from './prompt.factory.js';

describe('AI dialect prompts', () => {
  it('requests Najdi and Hijazi distinctions in the matching Bangla and English fields', () => {
    const [systemMessage] = createSaudiTeacherPrompt('مرحبا');

    expect(systemMessage.content).toContain('Najdi and Hijazi');
    expect(systemMessage.content).toContain('whenToUseBn');
    expect(systemMessage.content).toContain('whenToUseEn');
    expect(systemMessage.content).toContain('"Arabs"');
    expect(systemMessage.content).toContain('"আরবরা"');
    expect(systemMessage.content).toContain('Bangla pronunciation and explanations in Bangla');
    expect(systemMessage.content).toContain('English pronunciation and explanations in English');
  });

  it('uses the shared Najdi/Hijazi form when translating without regional context', () => {
    const [systemMessage] = textToTranslateSaudiNativeArabic('Hello');

    expect(systemMessage.content).toContain('spoken Najdi and Hijazi Arabic');
    expect(systemMessage.content).toContain(
      'Prefer wording shared across both dialects',
    );
    expect(systemMessage.content).toContain('Output ONLY the Arabic translation.');
  });

  it('generates only bilingual usage context for the requested item type', () => {
    const [systemMessage, userMessage] = createUsageContextPrompt({
      itemType: 'sentence',
      arabicText: 'مرحبا',
      meaningEn: 'Hello',
      meaningBn: 'হ্যালো',
    });

    expect(systemMessage.content).toContain('whenToUseEn in English');
    expect(systemMessage.content).toContain('whenToUseBn in Bangla');
    expect(systemMessage.content).toContain('Never use "Saudi"');
    expect(userMessage.content).toContain('Arabic sentence: مرحبا');
    expect(userMessage.content).toContain('Meaning in English: Hello');
    expect(userMessage.content).toContain('Meaning in Bangla: হ্যালো');
  });

  it('keeps usage explanations simple without dialect comparisons', () => {
    const prompts = [
      createSaudiTeacherPrompt('مرحبا')[0].content,
      createUsageContextPrompt({
        itemType: 'word',
        arabicText: 'مرحبا',
        meaningEn: 'Hello',
        meaningBn: 'হ্যালো',
      })[0].content,
    ];

    for (const prompt of prompts) {
      expect(prompt).toContain(
        'Give a simple, natural explanation of when and why the expression is used.',
      );
      expect(prompt).toContain(
        'If it is commonly used as a reply to a particular word, phrase, or question, explain what it responds to',
      );
      expect(prompt).toContain(
        'do not invent a trigger',
      );
      expect(prompt).toContain(
        'Do not mention dialects, dialect names, regions, or compare varieties.',
      );
      expect(prompt).toContain(
        'Arabs use this daily as a warm greeting when meeting someone or welcoming them.',
      );
      expect(prompt).toContain(
        'আরবরা দৈনন্দিন জীবনে কারও সাথে দেখা হলে বা কাউকে স্বাগত জানাতে এই শব্দটি ব্যবহার করেন।',
      );
      expect(prompt).not.toContain('This is the Hijazi form');
      expect(prompt).not.toContain('[Najdi form]');
      expect(prompt).not.toContain('[নাজদি রূপ]');
    }
  });
});
