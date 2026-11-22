import { describe, expect, it, vi } from 'vitest';
import { logger } from '../../common/http/logger.js';
import * as dbModule from '../../database/db.js';
import type { AiService } from './ai.service.js';
import type { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import type { WordRepository } from '../words/word.repository.js';
import { createAiWordService } from './ai-word.service.js';

describe('AiWordService', () => {
  it('stores reply usage in the bilingual when-to-use text on word creation', async () => {
    vi.spyOn(dbModule, 'withTransaction').mockImplementation(async (callback) =>
      callback({} as never),
    );
    const entities = {
      findByNormalizedText: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'entity-1' }),
    } as unknown as ArabicEntityRepository;
    const words = {
      findByEntityId: vi.fn(),
      generateNextWordKey: vi.fn().mockResolvedValue('W-2001'),
      insert: vi.fn().mockResolvedValue({ id: 'word-1' }),
    } as unknown as WordRepository;
    const ai = {
      generateContent: vi.fn().mockResolvedValue({
        meaningEn: 'Thank you',
        meaningBn: 'ধন্যবাদ',
        whenToUseEn: 'Say this in reply to تسلم (tislam).',
        whenToUseBn: 'تسلم (তিসলাম) বললে জবাবে এটি বলা হয়।',
        pronunciationEn: 'tislam',
        pronunciationBn: 'তিসলাম',
        feminineEn: 'Same for both genders',
        feminineBn: 'ছেলে এবং মেয়ে উভয়ের জন্য একই রূপ',
        category: 'Greetings & Introductions',
      }),
    } as unknown as AiService;
    const service = createAiWordService({ ai, entities, words, logger });

    await service.createWordViaAi('تسلم');

    expect(words.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        whenToUseEn: 'Say this in reply to تسلم (tislam).',
        whenToUseBn: 'تسلم (তিসলাম) বললে জবাবে এটি বলা হয়।',
      }),
      expect.anything(),
    );
  });
});
