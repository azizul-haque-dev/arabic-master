import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AiService } from '../ai/ai.service.js';
import { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import { SentenceRepository } from './sentence.repository.js';
import { SentenceService } from './sentence.service.js';

vi.mock('./sentence.queue.js', () => ({
  sentenceQueue: { add: vi.fn(), getJob: vi.fn() },
}));

describe('SentenceService.resolveWithAi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
      'user-1',
      { sentenceType: 'SHORT' },
    );

    expect(translate).not.toHaveBeenCalled();
    expect(generate).toHaveBeenCalledWith(
      'صباح الخير',
      'user-1',
      { sentenceType: 'SHORT' },
    );
    expect(result).toEqual({ sentence, createdViaAi: false });
  });

  it('rejects non-Arabic text instead of translating it', async () => {
    const translate = vi.spyOn(AiService, 'translateToArabic');

    await expect(
      SentenceService.resolveWithAi('How are you?', 'user-1', {
        sentenceType: 'LONG',
      }),
    ).rejects.toThrow('Only Arabic text');

    expect(translate).not.toHaveBeenCalled();
  });
});
