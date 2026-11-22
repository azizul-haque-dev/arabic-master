import { describe, expect, it } from 'vitest';
import { buildModelCandidates } from './ai.service.js';

describe('buildModelCandidates', () => {
  it('tries lite models before larger fallbacks and configured models', () => {
    expect(buildModelCandidates('custom-model')).toEqual([
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'custom-model',
    ]);
  });

  it('does not retry a configured fallback model twice', () => {
    expect(buildModelCandidates('gemini-3.6-flash')).toEqual([
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.6-flash',
    ]);
  });
});
