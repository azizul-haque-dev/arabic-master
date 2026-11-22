import { afterEach, describe, expect, it, vi } from 'vitest';
import { ArabicEntityRepository } from './arabic-entity.repository.js';
import { ConflictError } from '../../common/errors/app-error.js';
import { db, type Tx } from '../../database/db.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ArabicEntityRepository.create', () => {
  it('uses read-committed transactions for generated-key retries', async () => {
    const entity = {
      id: 'entity-1',
      entityKey: 'AE-1001',
      arabicText: 'مرحبا',
      normalizedText: 'مرحبا',
      audioUrl: null,
      meaningBangla: null,
      meaningEnglish: null,
      pronunciationBangla: '',
      pronunciationEnglish: '',
      status: 'DRAFT' as const,
      rejectionReason: null,
      createdById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockExecutor = {
      execute: vi.fn().mockResolvedValue({ rows: [] }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([entity]),
        }),
      }),
    } as unknown as Tx;
    const transaction = vi.spyOn(db, 'transaction').mockImplementation(
      (callback) => callback(mockExecutor as never),
    );

    await expect(
      ArabicEntityRepository.create({ arabicText: 'مرحبا' }),
    ).resolves.toMatchObject({ entityKey: 'AE-1001' });

    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'read committed',
    });
  });

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
    } as unknown as Tx;

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
    } as unknown as Tx;

    await ArabicEntityRepository.create({ arabicText: 'مرحبا' }, mockExecutor);

    expect(calls[0]).toBe('execute');
    expect(calls.indexOf('insert')).toBeGreaterThan(0);
    expect(calls.indexOf('insert')).toBeLessThan(calls.lastIndexOf('execute'));
  });

  it('retries generated keys after a concurrent unique-key collision', async () => {
    let insertAttempts = 0;
    const mockExecutor = {
      execute: vi.fn().mockImplementation(async (query) => {
        const text = query?.queryChunks ? query.queryChunks.join('') : '';
        return text.includes('MAX(')
          ? { rows: [{ max_num: 1000 }] }
          : { rows: [] };
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
            insertAttempts += 1;
            if (insertAttempts === 1) {
              throw {
                code: '23505',
                constraint: 'ArabicEntity_entityKey_unique',
              };
            }
            return [{ id: 'entity-1', entityKey: 'AE-1002' }];
          }),
        }),
      }),
    } as unknown as Tx;

    await expect(
      ArabicEntityRepository.create({ arabicText: 'مرحبا' }, mockExecutor),
    ).resolves.toMatchObject({ entityKey: 'AE-1002' });
    expect(insertAttempts).toBe(2);
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
    } as unknown as Tx;

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
