import { describe, expect, it, vi } from 'vitest';
import { generateNextSequentialKey } from './key-generator.util.js';
import type { Executor } from '../../database/db.js';

describe('generateNextSequentialKey', () => {
  it('should return baseNumber + 1 when table has no matching rows', async () => {
    const mockExecutor = {
      execute: vi.fn().mockResolvedValue({
        rows: [{ max_num: null }],
      }),
    } as unknown as Executor;

    const key = await generateNextSequentialKey('Word', 'wordKey', 'W-', 2000, mockExecutor);
    expect(key).toBe('W-2001');
    expect(mockExecutor.execute).toHaveBeenCalled();
  });

  it('should return maxNum + 1 when matching rows exist', async () => {
    const mockExecutor = {
      execute: vi.fn().mockResolvedValue({
        rows: [{ max_num: 2048 }],
      }),
    } as unknown as Executor;

    const key = await generateNextSequentialKey('Word', 'wordKey', 'W-', 2000, mockExecutor);
    expect(key).toBe('W-2049');
  });

  it('should generate CNV-3015 for Conversation when max is 3014', async () => {
    const mockExecutor = {
      execute: vi.fn().mockResolvedValue({
        rows: [{ max_num: 3014 }],
      }),
    } as unknown as Executor;

    const key = await generateNextSequentialKey('Conversation', 'conversationKey', 'CNV-', 3000, mockExecutor);
    expect(key).toBe('CNV-3015');
  });

  it('should generate CRS-1002 for Course when max is 1001', async () => {
    const mockExecutor = {
      execute: vi.fn().mockResolvedValue({
        rows: [{ max_num: 1001 }],
      }),
    } as unknown as Executor;

    const key = await generateNextSequentialKey('Course', 'courseKey', 'CRS-', 1000, mockExecutor);
    expect(key).toBe('CRS-1002');
  });

  it('should generate LSN-4022 for Lesson when max is 4021', async () => {
    const mockExecutor = {
      execute: vi.fn().mockResolvedValue({
        rows: [{ max_num: 4021 }],
      }),
    } as unknown as Executor;

    const key = await generateNextSequentialKey('Lesson', 'lessonKey', 'LSN-', 4000, mockExecutor);
    expect(key).toBe('LSN-4022');
  });

  it('should generate SEC-2002 for Section when max is 2001', async () => {
    const mockExecutor = {
      execute: vi.fn().mockResolvedValue({
        rows: [{ max_num: 2001 }],
      }),
    } as unknown as Executor;

    const key = await generateNextSequentialKey('Section', 'sectionKey', 'SEC-', 2000, mockExecutor);
    expect(key).toBe('SEC-2002');
  });

  it('should generate SNT-1025 for Sentence when max is 1024', async () => {
    const mockExecutor = {
      execute: vi.fn().mockResolvedValue({
        rows: [{ max_num: 1024 }],
      }),
    } as unknown as Executor;

    const key = await generateNextSequentialKey('Sentence', 'sentenceKey', 'SNT-', 1000, mockExecutor);
    expect(key).toBe('SNT-1025');
  });

  it('should generate AE-1025 for ArabicEntity when max is 1024', async () => {
    const mockExecutor = {
      execute: vi.fn().mockResolvedValue({
        rows: [{ max_num: 1024 }],
      }),
    } as unknown as Executor;

    const key = await generateNextSequentialKey('ArabicEntity', 'entityKey', 'AE-', 1000, mockExecutor);
    expect(key).toBe('AE-1025');
  });
});
