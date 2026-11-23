import { describe, expect, it } from 'vitest';
import { listArabicEntityQuerySchema } from './arabic-entity.schemas.js';

describe('listArabicEntityQuerySchema', () => {
  it('accepts one missing field from a query string', () => {
    expect(
      listArabicEntityQuerySchema.parse({
        page: '1',
        limit: '50',
        missing: 'meaningEnglish',
      }),
    ).toMatchObject({ missing: ['meaningEnglish'] });
  });

  it('accepts multiple missing fields and rejects unsupported fields', () => {
    expect(
      listArabicEntityQuerySchema.parse({
        missing: ['meaningEnglish', 'pronunciationBangla'],
      }).missing,
    ).toEqual(['meaningEnglish', 'pronunciationBangla']);

    expect(
      listArabicEntityQuerySchema.safeParse({ missing: ['audio'] }).success,
    ).toBe(false);
  });
});
