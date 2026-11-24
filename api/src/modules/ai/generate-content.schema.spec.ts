import { describe, expect, it } from 'vitest';
import {
  generateContentSchema,
  generateWordListSchema,
} from './generate-content.schema.js';

describe('generateContentSchema', () => {
  it('accepts only Arabic single-query input', () => {
    expect(generateContentSchema.parse({ query: 'مرحبا' })).toEqual({
      query: 'مرحبا',
    });
    expect(generateContentSchema.safeParse({ query: 'hello' }).success).toBe(
      false,
    );
    expect(generateContentSchema.safeParse({ query: ['word'] }).success).toBe(
      false,
    );
  });
});

describe('generateWordListSchema', () => {
  it('accepts an Arabic batch of up to 25 queries', () => {
    const queries = Array.from({ length: 25 }, (_, index) => `مرحبا${index}`);
    expect(generateWordListSchema.parse({ query: queries }).query).toEqual(
      queries,
    );
  });

  it('rejects empty and oversized batches', () => {
    expect(generateWordListSchema.safeParse({ query: [] }).success).toBe(false);
    expect(
      generateWordListSchema.safeParse({
        query: Array.from({ length: 26 }, (_, index) => `word ${index}`),
      }).success,
    ).toBe(false);
  });
});
