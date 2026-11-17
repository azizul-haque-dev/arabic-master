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

  it('uses natural shared-form and Hijazi-to-Najdi guidance in both generation paths', () => {
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
        'Arabs use this daily as a warm greeting when meeting someone or welcoming them.',
      );
      expect(prompt).not.toContain(
        'It is commonly used in both Najdi and Hijazi dialects as a friendly hello.',
      );
      expect(prompt).toContain(
        'আরবরা দৈনন্দিন জীবনে কারও সাথে দেখা হলে বা কাউকে স্বাগত জানাতে এই শব্দটি ব্যবহার করেন।',
      );
      expect(prompt).not.toContain(
        'এটি নাজদি এবং হিজাজি উভয় উপভাষাতেই অত্যন্ত পরিচিত',
      );
      expect(prompt).toContain(
        'When the expression is shared, describe how it is used without naming the dialects',
      );
      expect(prompt).toContain(
        'When the taught pronunciation is Hijazi and the form genuinely differs in Najdi',
      );
      expect(prompt).toContain('[Najdi form]');
      expect(prompt).toContain('[নাজদি রূপ]');
      expect(prompt).toContain(
        'never invent one',
      );
    }
  });
});
