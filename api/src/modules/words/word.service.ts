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
import { AiService } from '../ai/ai.service.js';
import { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import { wordQueue } from './word.queue.js';
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
        const wordKey = await WordRepository.generateNextWordKey(attempts);
        return await WordRepository.insert({
          id: randomUUIDv7(),
          wordKey,
          entityId: entity.id,
          ...fields,
          wordType: fields.wordType ?? WordType.OTHER,
          status: ContentStatus.DRAFT,
          createdById,
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
    const text = isArabicText(rawText)
      ? rawText
      : await AiService.translateToArabic(rawText);
    const normalizedText = normalizeArabicText(text);

    let entity =
      await ArabicEntityRepository.findByNormalizedText(normalizedText);
    if (entity) {
      const existingWord = await WordRepository.findByEntityId(entity.id);
      if (existingWord) return existingWord;
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
        if (existingWord) return existingWord;
      }
    }

    const empty = '';
    let attempts = 0;
    let word = null;
    while (attempts < 5) {
      try {
        const wordKey = await WordRepository.generateNextWordKey(attempts);
        word = await WordRepository.insert({
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
    for (const query of queries) {
      try {
        const word = await WordService.generateWithAi(query, createdById);
        const job = await wordQueue.getJob(word.id);
        results.push({
          query,
          success: true as const,
          wordId: word.id,
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
};
