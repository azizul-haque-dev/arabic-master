import { v7 as randomUUIDv7 } from 'uuid';
import { DEFAULT_CATEGORY } from '../../common/constants/category.constant.js';
import { ConflictError, NotFoundError } from '../../common/errors/app-error.js';
import { paginated } from '../../common/http/response.js';
import { isUniqueViolation } from '../../common/utils/db-error.util.js';
import {
  isArabicText,
  normalizeArabicText,
} from '../../common/utils/normalize-arabic.util.js';
import { withTransaction } from '../../database/db.js';
import {
  ContentStatus,
  DifficultyLevel,
  SentenceType,
} from '../../database/drizzle/enums.js';
import { AiService } from '../ai/ai.service.js';
import { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import { sentenceQueue } from './sentence.queue.js';
import { SentenceRepository } from './sentence.repository.js';
import type {
  CreateSentenceInput,
  ListSentenceQuery,
  UpdateSentenceInput,
} from './sentence.schemas.js';

type WordLink = { wordId: string; position: number };

export interface SentenceAiOptions {
  sentenceType?: SentenceType;
  linkWords?: boolean;
  relatedWordId?: string;
}

type SentenceGenerationBatchResult =
  | {
      query: string;
      success: true;
      sentenceId: string;
      jobId: string | null;
      queued: boolean;
    }
  | { query: string; success: false; error: string };

function replaceWords(sentenceId: string, words: WordLink[]) {
  return withTransaction(async (tx) => {
    await SentenceRepository.replaceWords(sentenceId, words, tx);
    return SentenceRepository.findById(sentenceId, tx);
  });
}

export const SentenceService = {
  async list(q: ListSentenceQuery, forcedType?: SentenceType) {
    const sentenceType = forcedType ?? q.sentenceType ?? q.type;
    const { items, total } = await SentenceRepository.list({
      ...q,
      sentenceType,
    });
    return paginated(items, q.page, q.limit, total);
  },

  async listShort(q: ListSentenceQuery) {
    return SentenceService.list(q, SentenceType.SHORT);
  },

  async listLong(q: ListSentenceQuery) {
    return SentenceService.list(q, SentenceType.LONG);
  },

  async getById(id: string) {
    const sentence = await SentenceRepository.findById(id);
    if (!sentence) throw new NotFoundError('Sentence not found');
    return sentence;
  },

  async create(
    dto: CreateSentenceInput,
    createdById: string,
    forcedType?: SentenceType,
  ) {
    const { text, audioUrl, words, ...fields } = dto;
    const sentenceType =
      forcedType ?? fields.sentenceType ?? SentenceType.LONG;

    let entity = await ArabicEntityRepository.findByNormalizedText(
      normalizeArabicText(text),
    );
    if (entity) {
      if (await SentenceRepository.findByEntityId(entity.id))
        throw new ConflictError(
          'A sentence already exists for this Arabic text',
        );
    } else {
      entity = await ArabicEntityRepository.create({
        arabicText: text,
        audioUrl,
        createdById,
      });
    }

    let attempts = 0;
    let sentence = null;
    while (attempts < 5) {
      try {
        const sentenceKey =
          await SentenceRepository.generateNextSentenceKey(attempts);
        sentence = await SentenceRepository.insert({
          id: randomUUIDv7(),
          sentenceKey,
          entityId: entity.id,
          ...fields,
          sentenceType,
          difficulty: fields.difficulty ?? DifficultyLevel.BEGINNER,
          status: ContentStatus.DRAFT,
          createdById,
        });
        break;
      } catch (err: unknown) {
        const pgErr = err as { code?: string; constraint?: string };
        if (
          pgErr?.code === '23505' &&
          pgErr?.constraint?.includes('sentenceKey')
        ) {
          attempts++;
          continue;
        }
        throw err;
      }
    }
    if (!sentence)
      throw new Error('Failed to generate unique sentenceKey after 5 attempts');
    return words?.length
      ? replaceWords(sentence.id, words)
      : SentenceRepository.findById(sentence.id);
  },

  async createShort(dto: CreateSentenceInput, createdById: string) {
    return SentenceService.create(dto, createdById, SentenceType.SHORT);
  },

  async createLong(dto: CreateSentenceInput, createdById: string) {
    return SentenceService.create(dto, createdById, SentenceType.LONG);
  },

  async update(id: string, dto: UpdateSentenceInput) {
    await SentenceService.getById(id);
    // TODO: text/audioUrl আসলে entity-র field; আগের কোডেও ignore হত
    const { words, text: _t, audioUrl: _a, ...rest } = dto;
    await SentenceRepository.update(id, {
      ...rest,
      updatedAt: new Date(),
    });
    if (words) {
      return replaceWords(id, words);
    }
    return SentenceRepository.findById(id);
  },

  async remove(id: string) {
    await SentenceService.getById(id);
    await SentenceRepository.delete(id);
  },

  async generateWithAi(
    rawText: string,
    createdById: string,
    typeOrOptions: SentenceType | SentenceAiOptions = SentenceType.LONG,
  ) {
    const opts: SentenceAiOptions =
      typeof typeOrOptions === 'string'
        ? { sentenceType: typeOrOptions }
        : typeOrOptions;
    const sentenceType = opts.sentenceType ?? SentenceType.LONG;
    const linkWords = opts.linkWords ?? false;
    const relatedWordId = opts.relatedWordId;

    const text = isArabicText(rawText)
      ? rawText
      : await AiService.translateToArabic(rawText);
    const normalizedText = normalizeArabicText(text);

    const queueSentenceJobIfNeeded = async (
      existingSentence: NonNullable<
        Awaited<ReturnType<typeof SentenceRepository.findByEntityId>>
      >,
    ) => {
      let current = existingSentence;
      const needsPatch =
        current.sentenceType !== sentenceType ||
        (relatedWordId !== undefined && current.relatedWordId !== relatedWordId);
      if (needsPatch) {
        current =
          (await SentenceRepository.update(current.id, {
            sentenceType,
            ...(relatedWordId !== undefined ? { relatedWordId } : {}),
            updatedAt: new Date(),
          })) ?? current;
      }

      const isMissingContent =
        !current.meaningBn ||
        !current.meaningEn ||
        current.meaningBn.trim() === '' ||
        current.meaningEn.trim() === '';

      if (isMissingContent) {
        const existingJob = await sentenceQueue.getJob(current.id);
        if (!existingJob) {
          await sentenceQueue.add(
            'process-sentence',
            {
              sentenceId: current.id,
              arabicText: text,
              createdById,
              linkWords,
            },
            { jobId: current.id },
          );
        } else {
          const state = await existingJob.getState();
          if (state === 'failed') {
            try {
              await existingJob.remove();
            } catch (err: unknown) {
              const error = err as Error;
              if (!error?.message?.includes('locked')) throw err;
            }
            await sentenceQueue.add(
              'process-sentence',
              {
                sentenceId: current.id,
                arabicText: text,
                createdById,
                linkWords,
              },
              { jobId: current.id },
            );
          }
        }
      } else if (linkWords) {
        await sentenceQueue.add('resync-sentence-words', {
          sentenceId: current.id,
          arabicText: text,
        });
      }
      return (await SentenceRepository.findById(current.id)) ?? current;
    };

    let entity =
      await ArabicEntityRepository.findByNormalizedText(normalizedText);
    if (entity) {
      const existing = await SentenceRepository.findByEntityId(entity.id);
      if (existing) return queueSentenceJobIfNeeded(existing);
    } else {
      try {
        entity = await ArabicEntityRepository.create({
          arabicText: text,
          createdById,
        });
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
        entity =
          await ArabicEntityRepository.findByNormalizedText(normalizedText);
        if (!entity) throw error;

        const existing = await SentenceRepository.findByEntityId(entity.id);
        if (existing) return queueSentenceJobIfNeeded(existing);
      }
    }

    const blank = '';
    let attempts = 0;
    let sentence = null;
    while (attempts < 5) {
      try {
        const sentenceKey =
          await SentenceRepository.generateNextSentenceKey(attempts);
        sentence = await SentenceRepository.insert({
          id: randomUUIDv7(),
          sentenceKey,
          entityId: entity.id,
          meaningEn: blank,
          meaningBn: blank,
          whenToUseEn: blank,
          whenToUseBn: blank,
          pronunciationEn: blank,
          pronunciationBn: blank,
          feminineEn: blank,
          feminineBn: blank,
          sentenceType,
          relatedWordId: relatedWordId ?? null,
          category: DEFAULT_CATEGORY,
          difficulty: DifficultyLevel.BEGINNER,
          status: ContentStatus.DRAFT,
          createdById,
        });
        break;
      } catch (err: unknown) {
        const pgErr = err as { code?: string; constraint?: string };
        if (
          pgErr?.code === '23505' &&
          pgErr?.constraint?.includes('sentenceKey')
        ) {
          attempts++;
          continue;
        }
        throw err;
      }
    }
    if (!sentence)
      throw new Error('Failed to generate unique sentenceKey after 5 attempts');
    await sentenceQueue.add(
      'process-sentence',
      {
        sentenceId: sentence.id,
        arabicText: text,
        createdById,
        linkWords,
      },
      { jobId: sentence.id },
    );
    return (await SentenceRepository.findById(sentence.id)) ?? sentence;
  },

  async generateShortWithAi(
    rawText: string,
    createdById: string,
    options?: Omit<SentenceAiOptions, 'sentenceType'>,
  ) {
    return SentenceService.generateWithAi(rawText, createdById, {
      ...options,
      sentenceType: SentenceType.SHORT,
    });
  },

  async generateLongWithAi(
    rawText: string,
    createdById: string,
    options?: Omit<SentenceAiOptions, 'sentenceType'>,
  ) {
    return SentenceService.generateWithAi(rawText, createdById, {
      ...options,
      sentenceType: SentenceType.LONG,
    });
  },

  async generateManyWithAi(
    queries: string[],
    createdById: string,
    typeOrOptions: SentenceType | SentenceAiOptions = SentenceType.LONG,
  ) {
    const results: SentenceGenerationBatchResult[] = [];
    for (const query of queries) {
      try {
        const sentence = await SentenceService.generateWithAi(
          query,
          createdById,
          typeOrOptions,
        );
        const job = await sentenceQueue.getJob(sentence.id);
        results.push({
          query,
          success: true as const,
          sentenceId: sentence.id,
          jobId: job?.id ?? null,
          queued: Boolean(job),
        });
      } catch (error) {
        results.push({
          query,
          success: false as const,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return results;
  },

  async generateManyShortWithAi(
    queries: string[],
    createdById: string,
    options?: Omit<SentenceAiOptions, 'sentenceType'>,
  ) {
    return SentenceService.generateManyWithAi(queries, createdById, {
      ...options,
      sentenceType: SentenceType.SHORT,
    });
  },

  async generateManyLongWithAi(
    queries: string[],
    createdById: string,
    options?: Omit<SentenceAiOptions, 'sentenceType'>,
  ) {
    return SentenceService.generateManyWithAi(queries, createdById, {
      ...options,
      sentenceType: SentenceType.LONG,
    });
  },

  async getAiJobStatus(jobId: string) {
    const job = await sentenceQueue.getJob(jobId);
    if (!job) throw new NotFoundError('AI sentence-generation job not found');

    return {
      jobId: job.id,
      sentenceId: job.data.sentenceId,
      arabicText: job.data.arabicText,
      state: await job.getState(),
      attemptsMade: job.attemptsMade,
      maxAttempts: job.opts.attempts ?? 1,
      failedReason: job.failedReason || null,
    };
  },

  async regenerateWithAi(id: string, userId?: string) {
    const sentence = await SentenceRepository.findById(id);
    if (!sentence) throw new NotFoundError('Sentence not found');

    const entity = await ArabicEntityRepository.findById(sentence.entityId);
    const arabicText = entity?.arabicText;
    if (!arabicText) {
      throw new ConflictError('Sentence does not have associated Arabic text');
    }

    const createdById = sentence.createdById ?? userId ?? '';
    const existingJob = await sentenceQueue.getJob(sentence.id);
    if (existingJob) {
      const state = await existingJob.getState();
      if (state === 'active') {
        return {
          sentenceId: sentence.id,
          jobId: sentence.id,
          queued: true,
          message: 'AI generation is currently in progress',
        };
      }
      if (state === 'waiting' || state === 'delayed') {
        return {
          sentenceId: sentence.id,
          jobId: sentence.id,
          queued: true,
          message: 'AI generation is already queued',
        };
      }

      try {
        await existingJob.remove();
      } catch (err: unknown) {
        const error = err as Error;
        if (error?.message?.includes('locked')) {
          return {
            sentenceId: sentence.id,
            jobId: sentence.id,
            queued: true,
            message: 'AI generation is currently in progress',
          };
        }
        throw err;
      }
    }

    await sentenceQueue.add(
      'process-sentence',
      { sentenceId: sentence.id, arabicText, createdById },
      { jobId: sentence.id },
    );

    return {
      sentenceId: sentence.id,
      jobId: sentence.id,
      queued: true,
      message: 'AI generation queued successfully',
    };
  },

  async resyncWords(id: string) {
    const sentence = await SentenceService.getById(id);
    const entity = await ArabicEntityRepository.findById(sentence.entityId);
    if (!entity) throw new NotFoundError('Sentence entity not found');
    await sentenceQueue.add('resync-sentence-words', {
      sentenceId: sentence.id,
      arabicText: entity.arabicText,
    });
    return { sentenceId: sentence.id };
  },
};

export type SentenceService = typeof SentenceService;
