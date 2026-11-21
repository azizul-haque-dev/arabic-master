import { describe, expect, it, vi } from 'vitest';
import { ArabicEntityRepository } from './arabic-entity.repository.js';
import { ConflictError } from '../../common/errors/app-error.js';
import type { Executor } from '../../database/db.js';

describe('ArabicEntityRepository.create', () => {
  it('throws ConflictError if an entity with the same normalizedText already exists', async () => {
    const mockExecutor = {
      execute: vi.fn().mockResolvedValue({ rows: [] }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: '1',
                entityKey: 'AE-1024',
                arabicText: 'مرحبا',
                normalizedText: 'مرحبا',
              },
            ]),
          }),
        }),
      }),
    } as unknown as Executor;

    await expect(
      ArabicEntityRepository.create(
        {
          arabicText: 'مَرْحَبًا', // Normalizes to مرحبا
        },
        mockExecutor,
      ),
    ).rejects.toThrow(ConflictError);
  });

  it('serializes generated entity keys before inserting', async () => {
    const calls: string[] = [];
    const mockExecutor = {
      execute: vi.fn().mockImplementation(async () => {
        calls.push('execute');
        return { rows: [] };
      }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockImplementation(async () => {
            calls.push('insert');
            return [{ id: 'entity-1', entityKey: 'AE-1001' }];
          }),
        }),
      }),
    } as unknown as Executor;

    await ArabicEntityRepository.create({ arabicText: 'مرحبا' }, mockExecutor);

    expect(calls[0]).toBe('execute');
    expect(calls[calls.length - 1]).toBe('insert');
  });

  it('throws ConflictError if database throws unique violation on normalizedText', async () => {
    const mockExecutor = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      execute: vi.fn().mockImplementation(async (q) => {
        const text = q?.queryChunks ? q.queryChunks.join('') : '';
        if (text.includes('MAX(')) {
          return { rows: [{ max_num: 1024 }] };
        }
        return { rows: [] };
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue({
            code: '23505',
            constraint: 'ArabicEntity_normalizedText_unique',
          }),
        }),
      }),
    } as unknown as Executor;

    await expect(
      ArabicEntityRepository.create(
        {
          arabicText: 'مرحبا',
        },
        mockExecutor,
      ),
    ).rejects.toThrow(ConflictError);
  });
});
