import { Worker, type Job } from 'bullmq';
import {
  DEFAULT_CATEGORY,
  isValidCategory,
} from '../../common/constants/category.constant.js';
import {
  logger as defaultLogger,
  type Logger,
} from '../../common/http/logger.js';
import {
  cleanTextAndSpaces,
  isArabicText,
} from '../../common/utils/normalize-arabic.util.js';
import { SENTENCE_QUEUE_NAME } from '../../config/constants.js';
import { bullConnection } from '../../config/redis.js';
import { withTransaction } from '../../database/db.js';
import { AiService } from '../ai/ai.service.js';
import { AiWordService } from '../ai/ai-word.service.js';
import { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import { SentenceRepository } from './sentence.repository.js';

export interface SentenceProcessData {
  sentenceId: string;
  arabicText: string;
  createdById?: string;
  linkWords?: boolean;
}

export interface SentenceResyncData {
  sentenceId: string;
  arabicText: string;
}

export type SentenceJobData = SentenceProcessData | SentenceResyncData;
export type WordLink = { wordId: string; position: number };

export interface SentenceProcessorDependencies {
  sentences?: SentenceRepository;
  entities?: ArabicEntityRepository;
  ai?: AiService;
  aiWords?: AiWordService;
  logger?: Logger;
}

export const SentenceProcessor = {
  async process(
    job: Job<SentenceJobData>,
    dependencies: SentenceProcessorDependencies = {},
  ) {
    const sentences = dependencies.sentences ?? SentenceRepository;
    const entities = dependencies.entities ?? ArabicEntityRepository;
    const ai = dependencies.ai ?? AiService;
    const aiWords = dependencies.aiWords ?? AiWordService;
    const log = (dependencies.logger ?? defaultLogger).child({
      context: 'SentenceProcessor',
    });

    const replaceWords = (sentenceId: string, words: WordLink[]) =>
      withTransaction((tx) => sentences.replaceWords(sentenceId, words, tx));

    /** SentenceWord-এ (sentenceId, wordId) unique, তাই repeat হলে শুধু প্রথম position থাকে */
    async function resolveWords(
      arabicText: string,
      createdById?: string,
    ): Promise<WordLink[]> {
      const tokens = cleanTextAndSpaces(arabicText).split(' ').filter(Boolean);
      const seen = new Set<string>();
      const out: WordLink[] = [];

      for (let i = 0; i < tokens.length; i++) {
        try {
          const word = await aiWords.createWordViaAi(tokens[i], createdById);
          if (seen.has(word.id)) {
            log.warn(
              `Word "${tokens[i]}" repeats in this sentence — keeping only its first position.`,
            );
            continue;
          }
          seen.add(word.id);
          out.push({ wordId: word.id, position: i + 1 });
        } catch (err) {
          // একটা খারাপ word পুরো sentence-এর linking থামাবে না
          log.error({ err }, `Failed to resolve word "${tokens[i]}"`);
        }
      }
      return out;
    }

    if (job.name === 'resync-sentence-words') {
      const { sentenceId, arabicText } = job.data as SentenceResyncData;
      if (!(await sentences.findById(sentenceId))) {
        log.warn(
          `Sentence ${sentenceId} was deleted before resync ran — skipping.`,
        );
        return;
      }
      await replaceWords(sentenceId, await resolveWords(arabicText));
      return;
    }

    const { sentenceId, arabicText: rawText, createdById, linkWords } =
      job.data as SentenceProcessData;
    const sentence = await sentences.findById(sentenceId);
    if (!sentence) {
      log.warn(
        `Sentence ${sentenceId} was deleted before the AI job ran — skipping.`,
      );
      return;
    }

    let arabicText = rawText;
    if (!isArabicText(rawText)) {
      arabicText = await ai.translateToArabic(rawText);
      try {
        await entities.update(sentence.entityId, { arabicText });
      } catch (err) {
        log.warn(
          { err, sentenceId, entityId: sentence.entityId },
          'Could not update entity arabicText after deferred translation.',
        );
      }
    }

    const result = await ai.generateContent(arabicText);
    const category = isValidCategory(result.category)
      ? result.category
      : DEFAULT_CATEGORY;
    if (category !== result.category) {
      log.warn(
        `AI returned unknown category "${result.category}" for sentence ${sentenceId}`,
      );
    }

    await entities.updatePronunciation(sentence.entityId, {
      pronunciationBangla: result.pronunciationBn,
      pronunciationEnglish: result.pronunciationEn,
      meaningBangla: result.meaningBn,
      meaningEnglish: result.meaningEn,
    });

    await sentences.update(sentenceId, {
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

    if (linkWords !== false) {
      await replaceWords(
        sentenceId,
        await resolveWords(arabicText, createdById),
      );
    }
  },
};

export type SentenceProcessor = typeof SentenceProcessor;

export function createSentenceProcessor(
  dependencies?: SentenceProcessorDependencies,
) {
  return (job: Job<SentenceJobData>) =>
    SentenceProcessor.process(job, dependencies);
}

export function createSentenceWorker(
  handler?: (job: Job<SentenceJobData>) => Promise<void>,
  logger?: Logger,
) {
  const log = logger ?? defaultLogger;
  const jobHandler = handler ?? createSentenceProcessor({ logger: log });

  // ⚠️ প্রথমে concurrency 1 রাখুন; প্রতি sentence-এ অনেক LLM call হয় (Gemini rate-limit)
  const worker = new Worker(SENTENCE_QUEUE_NAME, jobHandler, {
    connection: bullConnection(),
    concurrency: 1,
  });

  worker.on('failed', (job, err) =>
    log.error(
      `Job ${job?.id} (${job?.name}) failed (attempt ${job?.attemptsMade}): ${err.message}`,
    ),
  );

  return worker;
}
