import { v7 as randomUUIDv7 } from 'uuid';
import { DEFAULT_CATEGORY } from '../../common/constants/category.constant.js';
import { ConflictError, NotFoundError } from '../../common/errors/app-error.js';
import { paginated } from '../../common/http/response.js';
import { isUniqueViolation } from '../../common/utils/db-error.util.js';
import {
  isArabicText,
  normalizeArabicText,
} from '../../common/utils/normalize-arabic.util.js';
import { ContentStatus, WordType } from '../../database/drizzle/enums.js';
import { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import { wordQueue } from './word.queue.js';
import { withTransaction } from '../../database/db.js';
import { resolveStatusChange } from '../../common/utils/content-workflow.util.js';
import type { UpdateStatusInput } from '../../common/schemas.js';
import type { RequestUser } from '../auth/auth.types.js';
import { WordRepository } from './word.repository.js';
import type {
  CreateWordInput,
  ListWordQuery,
  UpdateWordInput,
} from './word.schemas.js';

type WordGenerationBatchResult =
  | {
      query: string;
      success: true;
      wordId: string;
      jobId: string | null;
      queued: boolean;
    }
  | { query: string; success: false; error: string };

export const WordService = {
  async list(query: ListWordQuery) {
    const { items, total } = await WordRepository.list(query);
    return paginated(items, query.page, query.limit, total);
  },

  async getById(id: string) {
    const word = await WordRepository.findDetailedById(id);
    if (!word) throw new NotFoundError('Word not found');
    return word;
  },

  async create(input: CreateWordInput, createdById: string) {
    const { text, audioUrl, ...fields } = input;
    let entity = await ArabicEntityRepository.findByNormalizedText(
      normalizeArabicText(text),
    );

    if (entity) {
      if (await WordRepository.findByEntityId(entity.id)) {
        throw new ConflictError('A word already exists for this Arabic text');
      }
    } else {
      entity = await ArabicEntityRepository.create({
        arabicText: text,
        audioUrl,
        createdById,
      });
    }

    let attempts = 0;
    while (attempts < 5) {
      try {
        return await withTransaction(async (tx) => {
          const wordKey = await WordRepository.generateNextWordKey(tx, attempts);
          return WordRepository.insert(
            {
              id: randomUUIDv7(),
              wordKey,
              entityId: entity.id,
              ...fields,
              wordType: fields.wordType ?? WordType.OTHER,
              status: ContentStatus.DRAFT,
              createdById,
            },
            tx,
          );
        });
      } catch (err: unknown) {
        const pgErr = err as { code?: string; constraint?: string };
        if (pgErr?.code === '23505' && pgErr?.constraint?.includes('wordKey')) {
          attempts++;
          continue;
        }
        throw err;
      }
    }
    throw new Error('Failed to generate unique wordKey after 5 attempts');
  },

  async changeStatus(id: string, dto: UpdateStatusInput, actor: RequestUser) {
    return withTransaction(async (tx) => {
      const word = await WordRepository.lockById(id, tx);
      if (!word) throw new NotFoundError('Word not found');
      const next = resolveStatusChange({
        from: word.status,
        to: dto.status,
        role: actor.role,
        rejectionReason: dto.rejectionReason,
      });
      await WordRepository.update(id, next, tx);
      return WordRepository.findDetailedById(id, tx);
    });
  },

  async update(id: string, input: UpdateWordInput) {
    await WordService.getById(id);
    const { text: _text, audioUrl: _audioUrl, ...wordFields } = input;
    return WordRepository.update(id, { ...wordFields, updatedAt: new Date() });
  },

  async remove(id: string) {
    await WordService.getById(id);
    await WordRepository.delete(id);
  },

  async generateWithAi(rawText: string, createdById: string) {
    if (!isArabicText(rawText)) {
      throw new ConflictError('Only Arabic text can be generated with AI');
    }
    const text = rawText.trim();
    const normalizedText = normalizeArabicText(text);

    const queueWordJobIfNeeded = async (
      existingWord: NonNullable<
        Awaited<ReturnType<typeof WordRepository.findByEntityId>>
      >,
    ) => {
      const isMissingContent =
        !existingWord.meaningBn ||
        !existingWord.meaningEn ||
        existingWord.meaningBn.trim() === '' ||
        existingWord.meaningEn.trim() === '';

      if (isMissingContent) {
        const existingJob = await wordQueue.getJob(existingWord.id);
        if (!existingJob) {
          await wordQueue.add(
            'process-word',
            { wordId: existingWord.id, arabicText: text },
            { jobId: existingWord.id },
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
            await wordQueue.add(
              'process-word',
              { wordId: existingWord.id, arabicText: text },
              { jobId: existingWord.id },
            );
          }
        }
      }
      return existingWord;
    };

    let entity =
      await ArabicEntityRepository.findByNormalizedText(normalizedText);
    if (entity) {
      const existingWord = await WordRepository.findByEntityId(entity.id);
      if (existingWord) return queueWordJobIfNeeded(existingWord);
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

        const existingWord = await WordRepository.findByEntityId(entity.id);
        if (existingWord) return queueWordJobIfNeeded(existingWord);
      }
    }

    const empty = '';
    let attempts = 0;
    let word = null;
    while (attempts < 5) {
      try {
        word = await withTransaction(async (tx) => {
          const wordKey = await WordRepository.generateNextWordKey(tx, attempts);
          return WordRepository.insert(
            {
              id: randomUUIDv7(),
              wordKey,
              entityId: entity.id,
              meaningEn: empty,
              meaningBn: empty,
              whenToUseEn: empty,
              whenToUseBn: empty,
              pronunciationEn: empty,
              pronunciationBn: empty,
              feminineEn: empty,
              feminineBn: empty,
              category: DEFAULT_CATEGORY,
              status: ContentStatus.DRAFT,
              createdById,
            },
            tx,
          );
        });
        break;
      } catch (err: unknown) {
        const pgErr = err as { code?: string; constraint?: string };
        if (pgErr?.code === '23505' && pgErr?.constraint?.includes('wordKey')) {
          attempts++;
          continue;
        }
        throw err;
      }
    }
    if (!word)
      throw new Error('Failed to generate unique wordKey after 5 attempts');

    await wordQueue.add(
      'process-word',
      { wordId: word.id, arabicText: text },
      { jobId: word.id },
    );
    return word;
  },

  async generateManyWithAi(queries: string[], createdById: string) {
    const results: WordGenerationBatchResult[] = [];
    const processQuery = async (
      query: string,
    ): Promise<WordGenerationBatchResult> => {
      try {
        const word = await WordService.generateWithAi(query, createdById);
        const job = await wordQueue.getJob(word.id);
        return {
          query,
          success: true as const,
          wordId: word.id,
          jobId: job?.id ?? null,
          queued: Boolean(job),
        };
      } catch (error) {
        return {
          query,
          success: false as const,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    };

    const BATCH_SIZE = 3;
    for (let i = 0; i < queries.length; i += BATCH_SIZE) {
      const chunk = queries.slice(i, i + BATCH_SIZE);
      const chunkResults = await Promise.all(chunk.map(processQuery));
      results.push(...chunkResults);
    }
    return results;
  },

  async getAiJobStatus(jobId: string) {
    const job = await wordQueue.getJob(jobId);
    if (!job) throw new NotFoundError('AI word-generation job not found');

    return {
      jobId: job.id,
      wordId: job.data.wordId,
      arabicText: job.data.arabicText,
      state: await job.getState(),
      attemptsMade: job.attemptsMade,
      maxAttempts: job.opts.attempts ?? 1,
      failedReason: job.failedReason || null,
    };
  },

  async regenerateUsageContext(id: string) {
    const word = await WordRepository.findDetailedById(id);
    if (!word) throw new NotFoundError('Word not found');

    const arabicText = word.arabicText || word.entity?.arabicText;
    if (!arabicText) {
      throw new ConflictError('Word does not have associated Arabic text');
    }
    if (!isArabicText(arabicText)) {
      throw new ConflictError('Word does not have valid Arabic text');
    }

    const existingJob = await wordQueue.getJob(word.id);
    if (existingJob) {
      const state = await existingJob.getState();
      if (state === 'active' || state === 'waiting' || state === 'delayed') {
        if (existingJob.name === 'regenerate-word-usage') {
          return {
            wordId: word.id,
            jobId: word.id,
            queued: true,
            message: 'Usage-context regeneration is already in progress',
          };
        }
        throw new ConflictError(
          'Another AI operation is already in progress for this word',
        );
      }

      await existingJob.remove();
    }

    await wordQueue.add(
      'regenerate-word-usage',
      { wordId: word.id, arabicText },
      { jobId: word.id },
    );

    return {
      wordId: word.id,
      jobId: word.id,
      queued: true,
      message: 'Usage-context regeneration queued successfully',
    };
  },

  async regenerateBanglaPronunciation(id: string) {
    const word = await WordRepository.findDetailedById(id);
    if (!word) throw new NotFoundError('Word not found');

    const arabicText = word.arabicText || word.entity?.arabicText;
    if (!arabicText) {
      throw new ConflictError('Word does not have associated Arabic text');
    }
    if (!isArabicText(arabicText)) {
      throw new ConflictError('Word does not have valid Arabic text');
    }

    const existingJob = await wordQueue.getJob(word.id);
    if (existingJob) {
      const state = await existingJob.getState();
      if (state === 'active' || state === 'waiting' || state === 'delayed') {
        if (existingJob.name === 'regenerate-word-pronunciation-bn') {
          return {
            wordId: word.id,
            jobId: word.id,
            queued: true,
            message: 'Bangla pronunciation regeneration is already in progress',
          };
        }
        throw new ConflictError(
          'Another AI operation is already in progress for this word',
        );
      }

      await existingJob.remove();
    }

    await wordQueue.add(
      'regenerate-word-pronunciation-bn',
      { wordId: word.id, arabicText },
      { jobId: word.id },
    );

    return {
      wordId: word.id,
      jobId: word.id,
      queued: true,
      message: 'Bangla pronunciation regeneration queued successfully',
    };
  },

  async regenerateWithAi(id: string) {
    const word = await WordRepository.findDetailedById(id);
    if (!word) throw new NotFoundError('Word not found');

    const arabicText = word.arabicText || word.entity?.arabicText;
    if (!arabicText) {
      throw new ConflictError('Word does not have associated Arabic text');
    }

    const existingJob = await wordQueue.getJob(word.id);
    if (existingJob) {
      const state = await existingJob.getState();
      if (state === 'active') {
        if (existingJob.name !== 'process-word') {
          throw new ConflictError(
            'A targeted AI regeneration is already in progress for this word',
          );
        }
        return {
          wordId: word.id,
          jobId: word.id,
          queued: true,
          message: 'AI generation is currently in progress',
        };
      }
      if (state === 'waiting' || state === 'delayed') {
        if (existingJob.name !== 'process-word') {
          throw new ConflictError(
            'A targeted AI regeneration is already queued for this word',
          );
        }
        return {
          wordId: word.id,
          jobId: word.id,
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
            wordId: word.id,
            jobId: word.id,
            queued: true,
            message: 'AI generation is currently in progress',
          };
        }
        throw err;
      }
    }

    await wordQueue.add(
      'process-word',
      { wordId: word.id, arabicText },
      { jobId: word.id },
    );

    return {
      wordId: word.id,
      jobId: word.id,
      queued: true,
      message: 'AI generation queued successfully',
    };
  },
};
