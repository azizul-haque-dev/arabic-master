import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AiService } from '../ai/ai.service.js';
import { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import { Role } from '../../database/drizzle/enums.js';
import * as dbModule from '../../database/db.js';
import type { RequestUser } from '../auth/auth.types.js';
import { SentenceRepository } from './sentence.repository.js';
import { SentenceService } from './sentence.service.js';

vi.mock('./sentence.queue.js', () => ({
  sentenceQueue: { add: vi.fn(), getJob: vi.fn() },
}));

describe('SentenceService.resolveWithAi', () => {
  const admin: RequestUser = {
    userId: 'user-1',
    sessionId: 'session-1',
    jwtId: 'jwt-1',
    role: Role.ADMIN,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('SentenceService.create', () => {
    const admin: RequestUser = {
      userId: 'admin-1',
      sessionId: 'session-1',
      jwtId: 'jwt-1',
      role: Role.ADMIN,
    };

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('creates Admin-authored sentences and new entities as APPROVED', async () => {
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
      vi.spyOn(SentenceRepository, 'generateNextSentenceKey').mockResolvedValue('SNT-2001');
      const insertSentence = vi
        .spyOn(SentenceRepository, 'insert')
        .mockResolvedValue({ id: 'sentence-1' } as never);
      vi.spyOn(SentenceRepository, 'findById').mockResolvedValue({
        id: 'sentence-1',
      } as never);

      await SentenceService.create(
        {
          text: 'صباح الخير',
          meaningEn: 'Good morning',
          meaningBn: 'সুপ্রভাত',
          whenToUseEn: 'Use in the morning.',
          whenToUseBn: 'সকালে ব্যবহার করুন।',
          pronunciationEn: 'sabah alkhayr',
          pronunciationBn: 'সাবাহ আলখাইর',
          feminineEn: '',
          feminineBn: '',
          category: 'Greetings & Introductions',
        },
        admin,
      );

      expect(createEntity).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'APPROVED', createdById: admin.userId }),
      );
      expect(insertSentence).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'APPROVED',
          createdById: admin.userId,
        }),
        expect.anything(),
      );
    });
  });

  it('reuses an existing Arabic sentence without translating the query', async () => {
    const entity = { id: 'entity-1' } as Awaited<
      ReturnType<typeof ArabicEntityRepository.findByNormalizedText>
    >;
    const existing = { id: 'sentence-1', sentenceKey: 'SNT-1001' } as Awaited<
      ReturnType<typeof SentenceRepository.findByEntityId>
    >;
    const sentence = { id: 'sentence-1', sentenceKey: 'SNT-1001' } as Awaited<
      ReturnType<typeof SentenceService.generateWithAi>
    >;
    const translate = vi.spyOn(AiService, 'translateToArabic');
    vi.spyOn(ArabicEntityRepository, 'findByNormalizedText').mockResolvedValue(
      entity,
    );
    vi.spyOn(SentenceRepository, 'findByEntityId').mockResolvedValue(existing);
    const generate = vi
      .spyOn(SentenceService, 'generateWithAi')
      .mockResolvedValue(sentence);

    const result = await SentenceService.resolveWithAi(
      'صباح الخير',
      admin,
      { sentenceType: 'SHORT' },
    );

    expect(translate).not.toHaveBeenCalled();
    expect(generate).toHaveBeenCalledWith(
      'صباح الخير',
      admin,
      { sentenceType: 'SHORT' },
    );
    expect(result).toEqual({ sentence, createdViaAi: false });
  });

  it('rejects non-Arabic text instead of translating it', async () => {
    const translate = vi.spyOn(AiService, 'translateToArabic');

    await expect(
      SentenceService.resolveWithAi('How are you?', admin, {
        sentenceType: 'LONG',
      }),
    ).rejects.toThrow('Only Arabic text');

    expect(translate).not.toHaveBeenCalled();
  });
});
