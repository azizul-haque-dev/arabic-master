import { Worker, type Job } from 'bullmq';
import { DEFAULT_CATEGORY, isValidCategory } from '../../common/constants/category.constant.js';
import type { Logger } from '../../common/http/logger.js';
import { WORD_QUEUE_NAME } from '../../config/constants.js';
import { bullConnection } from '../../config/redis.js';
import type { AiService } from '../ai/ai.service.js';
import type { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import type { WordRepository } from './word.repository.js';

export function createWordProcessor(d: {
  words: WordRepository; entities: ArabicEntityRepository; ai: AiService; logger: Logger;
}) {
  const { words, entities, ai } = d;
  const logger = d.logger.child({ context: 'WordProcessor' });

  return async (job: Job<{ wordId: string; arabicText: string }>) => {
    const { wordId, arabicText } = job.data;

    const word = await words.findById(wordId);
    if (!word) {
      logger.warn(`Word ${wordId} was deleted before the AI job ran — skipping.`);
      return;
    }

    const result = await ai.generateContent(arabicText);
    const category = isValidCategory(result.category) ? result.category : DEFAULT_CATEGORY;
    if (category !== result.category) {
      logger.warn(`AI returned unknown category "${result.category}" for word ${wordId}`);
    }

    // Entity ও Word দুজনেই নিজের pronunciation কপি রাখে
    await entities.updatePronunciation(word.entityId, {
      pronunciationBangla: result.pronunciationBn,
      pronunciationEnglish: result.pronunciationEn,
    });

    await words.update(wordId, {
      meaningEn: result.meaningEn, meaningBn: result.meaningBn,
      whenToUseEn: result.whenToUseEn, whenToUseBn: result.whenToUseBn,
      pronunciationEn: result.pronunciationEn, pronunciationBn: result.pronunciationBn,
      feminineEn: result.feminineEn, feminineBn: result.feminineBn,
      noteEn: result.noteEn ?? null, noteBn: result.noteBn ?? null,
      category, updatedAt: new Date(),
    });
  };
}

export function createWordWorker(handler: ReturnType<typeof createWordProcessor>, logger: Logger) {
  const worker = new Worker(WORD_QUEUE_NAME, handler, { connection: bullConnection(), concurrency: 1 });
  worker.on('failed', (job, err) =>
    logger.error(`Word job ${job?.id} failed (attempt ${job?.attemptsMade}): ${err.message}`),
  );
  return worker;
}
