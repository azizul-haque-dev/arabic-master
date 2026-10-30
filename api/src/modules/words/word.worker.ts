import { Worker, type Job } from 'bullmq';
import {
  DEFAULT_CATEGORY,
  isValidCategory,
} from '../../common/constants/category.constant.js';
import {
  logger as defaultLogger,
  type Logger,
} from '../../common/http/logger.js';
import { AI_PROCESSING, WORD_QUEUE_NAME } from '../../config/constants.js';
import { bullConnection } from '../../config/redis.js';
import { AiService } from '../ai/ai.service.js';
import { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import { WordRepository } from './word.repository.js';

export interface WordJobData {
  wordId: string;
  arabicText: string;
}

export const WordProcessor = {
  async process(
    job: Job<WordJobData>,
    dependencies: {
      words?: WordRepository;
      entities?: ArabicEntityRepository;
      ai?: AiService;
      logger?: Logger;
    } = {},
  ) {
    const words = dependencies.words ?? WordRepository;
    const entities = dependencies.entities ?? ArabicEntityRepository;
    const ai = dependencies.ai ?? AiService;
    const log = (dependencies.logger ?? defaultLogger).child({
      context: 'WordProcessor',
    });

    const { wordId, arabicText } = job.data;

    const word = await words.findById(wordId);
    if (!word) {
      log.warn(`Word ${wordId} was deleted before the AI job ran — skipping.`);
      return;
    }

    const result = await ai.generateContent(arabicText);
    const category = isValidCategory(result.category)
      ? result.category
      : DEFAULT_CATEGORY;
    if (category !== result.category) {
      log.warn(
        `AI returned unknown category "${result.category}" for word ${wordId}`,
      );
    }

    // Entity ও Word দুজনেই নিজের pronunciation ও meaning কপি রাখে
    await entities.updatePronunciation(word.entityId, {
      pronunciationBangla: result.pronunciationBn,
      pronunciationEnglish: result.pronunciationEn,
      meaningBangla: result.meaningBn,
      meaningEnglish: result.meaningEn,
    });

    await words.update(wordId, {
      meaningEn: result.meaningEn,
      meaningBn: result.meaningBn,
      whenToUseEn: result.whenToUseEn,
      whenToUseBn: result.whenToUseBn,
      pronunciationEn: result.pronunciationEn,
      pronunciationBn: result.pronunciationBn,
      feminineEn: result.feminineEn,
      feminineBn: result.feminineBn,
      noteEn: result.noteEn ?? null,
      noteBn: result.noteBn ?? null,
      category,
      updatedAt: new Date(),
    });
  },
};

export type WordProcessor = typeof WordProcessor;

export function createWordProcessor(dependencies?: {
  words?: WordRepository;
  entities?: ArabicEntityRepository;
  ai?: AiService;
  logger?: Logger;
}) {
  return (job: Job<WordJobData>) => WordProcessor.process(job, dependencies);
}

export function createWordWorker(
  handler?: (job: Job<WordJobData>) => Promise<void>,
  logger?: Logger,
) {
  const log = logger ?? defaultLogger;
  const jobHandler = handler ?? createWordProcessor({ logger: log });

  const worker = new Worker(WORD_QUEUE_NAME, jobHandler, {
    connection: bullConnection(),
    concurrency: 1,
  });

  worker.on('failed', (job, err) => {
    const attempts = job?.opts.attempts ?? AI_PROCESSING.QUEUE_RETRY_ATTEMPTS;
    log.error(
      {
        err,
        jobId: job?.id,
        wordId: job?.data.wordId,
        arabicText: job?.data.arabicText,
        attemptsMade: job?.attemptsMade,
        maxAttempts: attempts,
        retriesExhausted: Boolean(job && job.attemptsMade >= attempts),
      },
      'Word AI generation job failed',
    );
  });

  return worker;
}
