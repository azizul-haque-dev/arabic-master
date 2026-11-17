import { describe, expect, it } from 'vitest';
import {
  createSaudiTeacherPrompt,
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
});
