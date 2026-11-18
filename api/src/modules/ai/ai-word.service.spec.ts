import { describe, expect, it, vi } from 'vitest';
import { logger } from '../../common/http/logger.js';
import type { AiService } from './ai.service.js';
import type { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import type { WordRepository } from '../words/word.repository.js';
import { createAiWordService } from './ai-word.service.js';

describe('AiWordService', () => {
  it('stores generated reply options when creating a word directly', async () => {
    const replyOptions = [
      {
        arabicText: 'الله يسلمك',
        pronunciationBn: 'আল্লাহ ইয়াসাল্লিমাক',
        pronunciationEn: 'allah yisallimak',
        meaningBn: 'আল্লাহ আপনাকে নিরাপদে রাখুন',
        meaningEn: 'May God keep you safe',
      },
    ];
    const entities = {
      findByNormalizedText: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'entity-1' }),
    } as unknown as ArabicEntityRepository;
    const words = {
      findByEntityId: vi.fn(),
      generateNextWordKey: vi.fn().mockResolvedValue('W-2001'),
      insert: vi.fn().mockResolvedValue({ id: 'word-1', replyOptions }),
    } as unknown as WordRepository;
    const ai = {
      generateContent: vi.fn().mockResolvedValue({
        meaningEn: 'Thank you',
        meaningBn: 'ধন্যবাদ',
        whenToUseEn: 'To thank someone.',
        whenToUseBn: 'কাউকে ধন্যবাদ জানাতে।',
        pronunciationEn: 'tislam',
        pronunciationBn: 'তিসলাম',
        feminineEn: 'Same for both genders',
        feminineBn: 'ছেলে এবং মেয়ে উভয়ের জন্য একই রূপ',
        replyOptions,
        category: 'Greetings & Introductions',
      }),
    } as unknown as AiService;
    const service = createAiWordService({ ai, entities, words, logger });

    await service.createWordViaAi('تسلم');

    expect(words.insert).toHaveBeenCalledWith(
      expect.objectContaining({ replyOptions }),
    );
  });
});
