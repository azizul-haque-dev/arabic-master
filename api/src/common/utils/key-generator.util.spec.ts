import { describe, expect, it, vi } from 'vitest';
import { generateNextSequentialKey } from './key-generator.util.js';
import type { Executor } from '../../database/db.js';

function createMockExecutor(maxNum: number | null, existingKeys: string[] = []) {
  return {
    execute: vi.fn().mockImplementation(async (q) => {
      const chunks = q.queryChunks || [];
      const text = chunks.map((c: any) => (typeof c === 'string' ? c : c?.value ?? '')).join('');
      if (text.includes('MAX(')) {
        return { rows: [{ max_num: maxNum }] };
      }
      // For SELECT 1 query, check if the candidate key is in existingKeys
      const hasKey = existingKeys.some((k) =>
        chunks.some((c: any) => c === k || c?.value === k || (typeof c === 'string' && c.includes(k))),
      );
      if (hasKey) {
        return { rows: [{ '?column?': 1 }] };
      }
      return { rows: [] };
    }),
  } as unknown as Executor;
}

describe('generateNextSequentialKey', () => {
  it('should return baseNumber + 1 when table has no matching rows', async () => {
    const mockExecutor = createMockExecutor(null);
    const key = await generateNextSequentialKey('Word', 'wordKey', 'W-', 2000, mockExecutor);
    expect(key).toBe('W-2001');
    expect(mockExecutor.execute).toHaveBeenCalled();
  });

  it('should return maxNum + 1 when matching rows exist', async () => {
    const mockExecutor = createMockExecutor(2048);
    const key = await generateNextSequentialKey('Word', 'wordKey', 'W-', 2000, mockExecutor);
    expect(key).toBe('W-2049');
  });

  it('should skip already existing keys if collision exists in table', async () => {
    // If max is 1024, but 1025 already exists in table, it should skip to 1026
    const mockExecutor = createMockExecutor(1024, ['AE-1025']);
    const key = await generateNextSequentialKey('ArabicEntity', 'entityKey', 'AE-', 1000, mockExecutor);
    expect(key).toBe('AE-1026');
  });

  it('should apply attemptOffset during retry', async () => {
    const mockExecutor = createMockExecutor(1000);
    const key = await generateNextSequentialKey('Course', 'courseKey', 'CRS-', 1000, mockExecutor, 2);
    expect(key).toBe('CRS-1003');
  });

  it('should generate CNV-3015 for Conversation when max is 3014', async () => {
    const mockExecutor = createMockExecutor(3014);
    const key = await generateNextSequentialKey('Conversation', 'conversationKey', 'CNV-', 3000, mockExecutor);
    expect(key).toBe('CNV-3015');
  });

  it('should generate CRS-1002 for Course when max is 1001', async () => {
    const mockExecutor = createMockExecutor(1001);
    const key = await generateNextSequentialKey('Course', 'courseKey', 'CRS-', 1000, mockExecutor);
    expect(key).toBe('CRS-1002');
  });

  it('should generate LSN-4022 for Lesson when max is 4021', async () => {
    const mockExecutor = createMockExecutor(4021);
    const key = await generateNextSequentialKey('Lesson', 'lessonKey', 'LSN-', 4000, mockExecutor);
    expect(key).toBe('LSN-4022');
  });

  it('should generate SEC-2002 for Section when max is 2001', async () => {
    const mockExecutor = createMockExecutor(2001);
    const key = await generateNextSequentialKey('Section', 'sectionKey', 'SEC-', 2000, mockExecutor);
    expect(key).toBe('SEC-2002');
  });

  it('should generate SNT-1025 for Sentence when max is 1024', async () => {
    const mockExecutor = createMockExecutor(1024);
    const key = await generateNextSequentialKey('Sentence', 'sentenceKey', 'SNT-', 1000, mockExecutor);
    expect(key).toBe('SNT-1025');
  });

  it('should generate AE-1025 for ArabicEntity when max is 1024', async () => {
    const mockExecutor = createMockExecutor(1024);
    const key = await generateNextSequentialKey('ArabicEntity', 'entityKey', 'AE-', 1000, mockExecutor);
    expect(key).toBe('AE-1025');
  });
});
