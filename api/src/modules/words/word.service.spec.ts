import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CATEGORY } from '../../common/constants/category.constant.js';
import * as dbModule from '../../database/db.js';
import { Role } from '../../database/drizzle/enums.js';
import type { RequestUser } from '../auth/auth.types.js';
import { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import { WordRepository } from './word.repository.js';
import { WordService } from './word.service.js';

vi.mock('./word.queue.js', () => ({
  wordQueue: { add: vi.fn(), getJob: vi.fn() },
}));

describe('WordService.create', () => {
  const admin: RequestUser = {
    userId: 'admin-1',
    sessionId: 'session-1',
    jwtId: 'jwt-1',
    role: Role.ADMIN,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates Admin-authored words and new entities as APPROVED', async () => {
    const entity = { id: 'entity-1' } as Awaited<
      ReturnType<typeof ArabicEntityRepository.findByNormalizedText>
    >;
    vi.spyOn(ArabicEntityRepository, 'findByNormalizedText').mockResolvedValue(null);
    const createEntity = vi
      .spyOn(ArabicEntityRepository, 'create')
      .mockResolvedValue(entity as NonNullable<typeof entity>);
    vi.spyOn(dbModule, 'withTransaction').mockImplementation(async (callback) =>
      callback({} as never),
    );
    vi.spyOn(WordRepository, 'generateNextWordKey').mockResolvedValue('W-2001');
    const insertWord = vi
      .spyOn(WordRepository, 'insert')
      .mockResolvedValue({ id: 'word-1' } as never);

    await WordService.create(
      {
        text: 'كتاب',
        meaningEn: 'book',
        meaningBn: 'বই',
        whenToUseEn: 'Use for a book.',
        whenToUseBn: 'বই বোঝাতে ব্যবহার করুন।',
        pronunciationEn: 'kitab',
        pronunciationBn: 'কিতাব',
        feminineEn: '',
        feminineBn: '',
        category: DEFAULT_CATEGORY,
      },
      admin,
    );

    expect(createEntity).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'APPROVED', createdById: admin.userId }),
    );
    expect(insertWord).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'APPROVED', createdById: admin.userId }),
      expect.anything(),
    );
  });
});
