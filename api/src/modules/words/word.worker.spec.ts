import type { Job } from 'bullmq';
import { describe, expect, it, vi } from 'vitest';
import type { ReplyOption } from '../ai/schemas/reply-option.schema.js';
import type { AiService } from '../ai/ai.service.js';
import type { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import type { WordRepository } from './word.repository.js';
import { WordProcessor } from './word.worker.js';

const replyOptions: ReplyOption[] = [
  {
    arabicText: 'الله يسلمك',
    pronunciationBn: 'আল্লাহ ইয়াসাল্লিমাক',
    pronunciationEn: 'allah yisallimak',
    meaningBn: 'আল্লাহ আপনাকে নিরাপদে রাখুন',
    meaningEn: 'May God keep you safe',
  },
];

describe('WordProcessor', () => {
  it('persists generated reply options', async () => {
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
        whenToUseEn: 'To thank someone.',
        whenToUseBn: 'কাউকে ধন্যবাদ জানাতে।',
        replyOptions,
        category: 'Greetings & Introductions',
      }),
    } as unknown as AiService;
    const job = {
      data: { wordId: 'word-1', arabicText: 'تسلم' },
    } as unknown as Job<{ wordId: string; arabicText: string }>;

    await WordProcessor.process(job, { words, entities, ai });

    expect(words.update).toHaveBeenCalledWith(
      'word-1',
      expect.objectContaining({ replyOptions }),
    );
  });
});
