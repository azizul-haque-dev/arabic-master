import type { Job } from 'bullmq';
import { describe, expect, it, vi } from 'vitest';
import type { ReplyOption } from '../ai/schemas/reply-option.schema.js';
import type { AiService } from '../ai/ai.service.js';
import type { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import type { SentenceRepository } from './sentence.repository.js';
import { SentenceProcessor } from './sentence.worker.js';

const replyOptions: ReplyOption[] = [
  {
    arabicText: 'العفو',
    pronunciationBn: 'আল-আফও',
    pronunciationEn: 'al-afw',
    meaningBn: 'আপনাকে স্বাগতম',
    meaningEn: "You're welcome",
  },
];

describe('SentenceProcessor', () => {
  it('persists generated reply options', async () => {
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
        whenToUseEn: 'To express gratitude.',
        whenToUseBn: 'কৃতজ্ঞতা জানাতে।',
        replyOptions,
        category: 'Greetings & Introductions',
      }),
    } as unknown as AiService;
    const job = {
      name: 'process-sentence',
      data: { sentenceId: 'sentence-1', arabicText: 'شكراً' },
    } as unknown as Job<{ sentenceId: string; arabicText: string }>;

    await SentenceProcessor.process(job, { sentences, entities, ai });

    expect(sentences.update).toHaveBeenCalledWith(
      'sentence-1',
      expect.objectContaining({ replyOptions }),
    );
  });
});
