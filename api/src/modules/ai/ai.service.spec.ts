import { describe, expect, it } from 'vitest';
import {
  buildModelCandidates,
  runWithModelFallback,
} from './ai.service.js';

describe('buildModelCandidates', () => {
  it('tries gemini-3.5-flash before lite fallbacks and configured models', () => {
    expect(buildModelCandidates('custom-model')).toEqual([
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.6-flash',
      'custom-model',
    ]);
  });

  it('does not retry a configured fallback model twice', () => {
    expect(buildModelCandidates('gemini-3.6-flash')).toEqual([
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.6-flash',
    ]);
  });
});

describe('runWithModelFallback', () => {
  it('tries candidates sequentially and stops at the first successful model', async () => {
    const attempts: string[] = [];
    let firstCandidateSettled = false;

    const result = await runWithModelFallback(
      ['first-model', 'second-model', 'third-model'],
      'test query',
      async (modelName) => {
        attempts.push(modelName);
        if (modelName === 'first-model') {
          await Promise.resolve();
          firstCandidateSettled = true;
          throw new Error('503 Service Unavailable');
        }
        expect(firstCandidateSettled).toBe(true);
        return 'generated content';
      },
    );

    expect(result).toBe('generated content');
    expect(attempts).toEqual(['first-model', 'second-model']);
  });

  it('surfaces the last error after trying every candidate', async () => {
    const attempts: string[] = [];
    const finalError = new Error('final model failed');

    await expect(
      runWithModelFallback(
        ['first-model', 'second-model', 'third-model'],
        'test query',
        async (modelName) => {
          attempts.push(modelName);
          throw modelName === 'third-model'
            ? finalError
            : new Error(`${modelName} failed`);
        },
      ),
    ).rejects.toBe(finalError);

    expect(attempts).toEqual(['first-model', 'second-model', 'third-model']);
  });
});
