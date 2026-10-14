import { Worker, type Job } from 'bullmq';
import {
  DEFAULT_CATEGORY,
  isValidCategory,
} from '../../common/constants/category.constant.js';
import type { Logger } from '../../common/http/logger.js';
import { cleanTextAndSpaces } from '../../common/utils/normalize-arabic.util.js';
import { SENTENCE_QUEUE_NAME } from '../../config/constants.js';
import { bullConnection } from '../../config/redis.js';
import { withTransaction } from '../../database/db.js';
import type { AiService } from '../ai/ai.service.js';
import type { AiWordService } from '../ai/ai-word.service.js';
import type { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import type { SentenceRepository } from './sentence.repository.js';

interface ProcessData {
  sentenceId: string;
  arabicText: string;
  createdById?: string;
}
interface ResyncData {
  sentenceId: string;
  arabicText: string;
}
type WordLink = { wordId: string; position: number };

export function createSentenceProcessor(dependencies: {
  sentences: SentenceRepository;
  entities: ArabicEntityRepository;
  ai: AiService;
  aiWords: AiWordService;
  logger: Logger;
}) {
  const { sentences, entities, ai, aiWords } = dependencies;
  const logger = dependencies.logger.child({ context: 'SentenceProcessor' });

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
          logger.warn(
            `Word "${tokens[i]}" repeats in this sentence — keeping only its first position.`,
          );
          continue;
        }
        seen.add(word.id);
        out.push({ wordId: word.id, position: i + 1 });
      } catch (err) {
        // একটা খারাপ word পুরো sentence-এর linking থামাবে না
        logger.error({ err }, `Failed to resolve word "${tokens[i]}"`);
      }
    }
    return out;
  }

  async function processSentence({
    sentenceId,
    arabicText,
    createdById,
  }: ProcessData) {
    const sentence = await sentences.findById(sentenceId);
    if (!sentence) {
      logger.warn(
        `Sentence ${sentenceId} was deleted before the AI job ran — skipping.`,
      );
      return;
    }

    const result = await ai.generateContent(arabicText);
    const category = isValidCategory(result.category)
      ? result.category
      : DEFAULT_CATEGORY;
    if (category !== result.category) {
      logger.warn(
        `AI returned unknown category "${result.category}" for sentence ${sentenceId}`,
      );
    }

    await entities.updatePronunciation(sentence.entityId, {
      pronunciationBangla: result.pronunciationBn,
      pronunciationEnglish: result.pronunciationEn,
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

    await replaceWords(sentenceId, await resolveWords(arabicText, createdById));
  }

  async function resync({ sentenceId, arabicText }: ResyncData) {
    if (!(await sentences.findById(sentenceId))) {
      logger.warn(
        `Sentence ${sentenceId} was deleted before resync ran — skipping.`,
      );
      return;
    }
    await replaceWords(sentenceId, await resolveWords(arabicText));
  }

  return async (job: Job<ProcessData | ResyncData>) => {
    if (job.name === 'resync-sentence-words')
      return resync(job.data as ResyncData);
    return processSentence(job.data as ProcessData);
  };
}

export function createSentenceWorker(
  handler: ReturnType<typeof createSentenceProcessor>,
  logger: Logger,
) {
  // ⚠️ প্রথমে concurrency 1 রাখুন; প্রতি sentence-এ অনেক LLM call হয় (Gemini rate-limit)
  const worker = new Worker(SENTENCE_QUEUE_NAME, handler, {
    connection: bullConnection(),
    concurrency: 1,
  });
  worker.on('failed', (job, err) =>
    logger.error(
      `Job ${job?.id} (${job?.name}) failed (attempt ${job?.attemptsMade}): ${err.message}`,
    ),
  );
  return worker;
}
