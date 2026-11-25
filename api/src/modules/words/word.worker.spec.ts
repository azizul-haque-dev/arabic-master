import type { Job } from 'bullmq';
import { describe, expect, it, vi } from 'vitest';
import type { AiService } from '../ai/ai.service.js';
import type { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import type { WordRepository } from './word.repository.js';
import { WordProcessor, type WordJobData } from './word.worker.js';

describe('WordProcessor', () => {
  it('persists reply usage in the bilingual when-to-use text', async () => {
    const words = {
      findById: vi.fn().mockResolvedValue({ entityId: 'entity-1' }),
      update: vi.fn().mockResolvedValue(undefined),
    } as unknown as WordRepository;
    const entities = {
      updatePronunciation: vi.fn().mockResolvedValue(undefined),
    } as unknown as ArabicEntityRepository;
    const ai = {
      generateContent: vi.fn().mockResolvedValue({
        meaningEn: 'Thank you',
        meaningBn: 'ধন্যবাদ',
        pronunciationEn: 'tislam',
        pronunciationBn: 'তিসলাম',
        feminineEn: 'Same for both genders',
        feminineBn: 'ছেলে এবং মেয়ে উভয়ের জন্য একই রূপ',
        whenToUseEn: 'Say this in reply to تسلم (tislam).',
        whenToUseBn: 'تسلم (তিসলাম) বললে জবাবে এটি বলা হয়।',
        category: 'Greetings & Introductions',
      }),
    } as unknown as AiService;
    const job = {
      name: 'process-word',
      data: { wordId: 'word-1', arabicText: 'تسلم' },
    } as unknown as Job<WordJobData>;

    await WordProcessor.process(job, { words, entities, ai });

    expect(ai.generateContent).toHaveBeenCalledWith('تسلم');

    expect(words.update).toHaveBeenCalledWith(
      'word-1',
      expect.objectContaining({
        whenToUseEn: 'Say this in reply to تسلم (tislam).',
        whenToUseBn: 'تسلم (তিসলাম) বললে জবাবে এটি বলা হয়।',
      }),
    );
  });

  it('updates only the bilingual usage fields during targeted regeneration', async () => {
    const word = {
      id: 'word-1',
      arabicText: 'أنا',
      entity: { arabicText: 'أنا' },
      meaningEn: 'I',
      meaningBn: 'আমি',
    } as unknown as NonNullable<
      Awaited<ReturnType<typeof WordRepository.findDetailedById>>
    >;
    const update = vi.fn();
    const words = {
      findDetailedById: vi.fn().mockResolvedValue(word),
      update,
    } as unknown as WordRepository;
    const ai = {
      generateUsageContext: vi.fn().mockResolvedValue({
        whenToUseEn: 'Use it when referring to yourself.',
        whenToUseBn: 'নিজের কথা বলার সময় এটি ব্যবহার করুন।',
      }),
    } as unknown as AiService;
    const job = {
      name: 'regenerate-word-usage',
      data: { wordId: 'word-1', arabicText: 'ignored' },
    } as Job<WordJobData>;

    await WordProcessor.process(job, { words, ai });

    expect(ai.generateUsageContext).toHaveBeenCalledWith({
      itemType: 'word',
      arabicText: 'أنا',
      meaningEn: 'I',
      meaningBn: 'আমি',
    });
    expect(update).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledWith(
      'word-1',
      expect.objectContaining({
        whenToUseEn: 'Use it when referring to yourself.',
        whenToUseBn: 'নিজের কথা বলার সময় এটি ব্যবহার করুন।',
      }),
    );
    const updatedFields = Object.keys(update.mock.calls[0][1]);
    expect(updatedFields.sort()).toEqual(
      ['updatedAt', 'whenToUseBn', 'whenToUseEn'].sort(),
    );
  });

  it('updates only Bangla pronunciation during targeted regeneration', async () => {
    const word = {
      id: 'word-1',
      entityId: 'entity-1',
      arabicText: 'صباح الخير',
      entity: { arabicText: 'صباح الخير' },
    } as unknown as NonNullable<
      Awaited<ReturnType<typeof WordRepository.findDetailedById>>
    >;
    const update = vi.fn();
    const words = {
      findDetailedById: vi.fn().mockResolvedValue(word),
      update,
    } as unknown as WordRepository;
    const updateBanglaPronunciation = vi.fn();
    const entities = {
      updateBanglaPronunciation,
    } as unknown as ArabicEntityRepository;
    const ai = {
      generateBanglaPronunciation: vi.fn().mockResolvedValue('ছাবাহুল খাইর'),
    } as unknown as AiService;
    const job = {
      name: 'regenerate-word-pronunciation-bn',
      data: { wordId: 'word-1', arabicText: 'ignored' },
    } as unknown as Job<WordJobData>;

    await WordProcessor.process(job, { words, entities, ai });

    expect(ai.generateBanglaPronunciation).toHaveBeenCalledWith('صباح الخير');
    expect(updateBanglaPronunciation).toHaveBeenCalledWith(
      'entity-1',
      'ছাবাহুল খাইর',
    );
    expect(update).toHaveBeenCalledWith(
      'word-1',
      expect.objectContaining({ pronunciationBn: 'ছাবাহুল খাইর' }),
    );
    expect(Object.keys(update.mock.calls[0][1]).sort()).toEqual(
      ['pronunciationBn', 'updatedAt'].sort(),
    );
  });
});
