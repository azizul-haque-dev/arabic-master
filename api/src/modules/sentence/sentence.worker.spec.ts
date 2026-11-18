import type { Job } from 'bullmq';
import { describe, expect, it, vi } from 'vitest';
import type { AiService } from '../ai/ai.service.js';
import type { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import type { SentenceRepository } from './sentence.repository.js';
import { SentenceProcessor, type SentenceJobData } from './sentence.worker.js';

describe('SentenceProcessor', () => {
  it('persists reply usage in the bilingual when-to-use text', async () => {
    const sentences = {
      findById: vi.fn().mockResolvedValue({ entityId: 'entity-1' }),
      update: vi.fn().mockResolvedValue(undefined),
    } as unknown as SentenceRepository;
    const entities = {
      updatePronunciation: vi.fn().mockResolvedValue(undefined),
    } as unknown as ArabicEntityRepository;
    const ai = {
      generateContent: vi.fn().mockResolvedValue({
        meaningEn: 'Thank you',
        meaningBn: 'ধন্যবাদ',
        pronunciationEn: 'shukran',
        pronunciationBn: 'শুকরান',
        feminineEn: 'Same for both genders',
        feminineBn: 'ছেলে এবং মেয়ে উভয়ের জন্য একই রূপ',
        whenToUseEn: 'Say this in reply to شكراً (shukran).',
        whenToUseBn: 'شكراً (শুকরান) বললে জবাবে এটি বলা হয়।',
        category: 'Greetings & Introductions',
      }),
    } as unknown as AiService;
    const job = {
      name: 'process-sentence',
      data: { sentenceId: 'sentence-1', arabicText: 'شكراً' },
    } as unknown as Job<SentenceJobData>;

    await SentenceProcessor.process(job, { sentences, entities, ai });

    expect(sentences.update).toHaveBeenCalledWith(
      'sentence-1',
      expect.objectContaining({
        whenToUseEn: 'Say this in reply to شكراً (shukran).',
        whenToUseBn: 'شكراً (শুকরান) বললে জবাবে এটি বলা হয়।',
      }),
    );
  });

  it('updates only the bilingual context fields during targeted regeneration', async () => {
    const sentence = {
      id: 'sentence-1',
      entityId: 'entity-1',
      meaningEn: 'Good morning',
      meaningBn: 'সুপ্রভাত',
    } as unknown as NonNullable<
      Awaited<ReturnType<typeof SentenceRepository.findById>>
    >;
    const update = vi.fn();
    const sentences = {
      findById: vi.fn().mockResolvedValue(sentence),
      update,
    } as unknown as SentenceRepository;
    const entities = {
      findById: vi.fn().mockResolvedValue({ arabicText: 'صباح الخير' }),
    } as unknown as ArabicEntityRepository;
    const ai = {
      generateUsageContext: vi.fn().mockResolvedValue({
        whenToUseEn: 'Use it as a morning greeting.',
        whenToUseBn: 'সকালে শুভেচ্ছা জানানোর জন্য এটি ব্যবহার করুন।',
      }),
    } as unknown as AiService;
    const job = {
      name: 'regenerate-sentence-context',
      data: { sentenceId: 'sentence-1', arabicText: 'ignored' },
    } as Job<SentenceJobData>;

    await SentenceProcessor.process(job, { sentences, entities, ai });

    expect(ai.generateUsageContext).toHaveBeenCalledWith({
      itemType: 'sentence',
      arabicText: 'صباح الخير',
      meaningEn: 'Good morning',
      meaningBn: 'সুপ্রভাত',
    });
    expect(update).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledWith(
      'sentence-1',
      expect.objectContaining({
        whenToUseEn: 'Use it as a morning greeting.',
        whenToUseBn: 'সকালে শুভেচ্ছা জানানোর জন্য এটি ব্যবহার করুন।',
      }),
    );
    const updatedFields = Object.keys(update.mock.calls[0][1]);
    expect(updatedFields.sort()).toEqual(
      ['updatedAt', 'whenToUseBn', 'whenToUseEn'].sort(),
    );
  });
});
