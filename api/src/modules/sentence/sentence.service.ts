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

function replaceWords(sentenceId: string, words: WordLink[]) {
  return withTransaction(async (tx) => {
    await SentenceRepository.replaceWords(sentenceId, words, tx);
    return SentenceRepository.findById(sentenceId, tx);
  });
}

export const SentenceService = {
  async list(q: ListSentenceQuery) {
    const { items, total } = await SentenceRepository.list(q);
    return paginated(items, q.page, q.limit, total);
  },

  async getById(id: string) {
    const sentence = await SentenceRepository.findById(id);
    if (!sentence) throw new NotFoundError('Sentence not found');
    return sentence;
  },

  async create(dto: CreateSentenceInput, createdById: string) {
    const { text, audioUrl, words, ...fields } = dto;

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
        const sentenceKey = await SentenceRepository.generateNextSentenceKey(attempts);
        sentence = await SentenceRepository.insert({
          id: randomUUIDv7(),
          sentenceKey,
          entityId: entity.id,
          ...fields,
          difficulty: fields.difficulty ?? DifficultyLevel.BEGINNER,
          status: ContentStatus.DRAFT,
          createdById,
        });
        break;
      } catch (err: unknown) {
        const pgErr = err as { code?: string; constraint?: string };
        if (pgErr?.code === '23505' && pgErr?.constraint?.includes('sentenceKey')) {
          attempts++;
          continue;
        }
        throw err;
      }
    }
    if (!sentence) throw new Error('Failed to generate unique sentenceKey after 5 attempts');
    return words?.length ? replaceWords(sentence.id, words) : sentence;
  },

  async update(id: string, dto: UpdateSentenceInput) {
    await SentenceService.getById(id);
    // TODO: text/audioUrl আসলে entity-র field; আগের কোডেও ignore হত
    const { words, text: _t, audioUrl: _a, ...rest } = dto;
    const sentence = await SentenceRepository.update(id, {
      ...rest,
      updatedAt: new Date(),
    });
    return words ? replaceWords(id, words) : sentence;
  },

  async remove(id: string) {
    await SentenceService.getById(id);
    await SentenceRepository.delete(id);
  },

  async generateWithAi(rawText: string, createdById: string) {
    const text = isArabicText(rawText)
      ? rawText
      : await AiService.translateToArabic(rawText);
    const normalizedText = normalizeArabicText(text);

    const queueSentenceJobIfNeeded = async (
      existingSentence: NonNullable<
        Awaited<ReturnType<typeof SentenceRepository.findByEntityId>>
      >,
    ) => {
      const isMissingContent =
        !existingSentence.meaningBn ||
        !existingSentence.meaningEn ||
        existingSentence.meaningBn.trim() === '' ||
        existingSentence.meaningEn.trim() === '';

      if (isMissingContent) {
        const existingJob = await sentenceQueue.getJob(existingSentence.id);
        if (!existingJob) {
          await sentenceQueue.add(
            'process-sentence',
            {
              sentenceId: existingSentence.id,
              arabicText: text,
              createdById,
            },
            { jobId: existingSentence.id },
          );
        } else {
          const state = await existingJob.getState();
          if (state === 'failed') {
            await existingJob.remove();
            await sentenceQueue.add(
              'process-sentence',
              {
                sentenceId: existingSentence.id,
                arabicText: text,
                createdById,
              },
              { jobId: existingSentence.id },
            );
          }
        }
      }
      return existingSentence;
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
        const sentenceKey = await SentenceRepository.generateNextSentenceKey(attempts);
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
          category: DEFAULT_CATEGORY,
          difficulty: DifficultyLevel.BEGINNER,
          status: ContentStatus.DRAFT,
          createdById,
        });
        break;
      } catch (err: unknown) {
        const pgErr = err as { code?: string; constraint?: string };
        if (pgErr?.code === '23505' && pgErr?.constraint?.includes('sentenceKey')) {
          attempts++;
          continue;
        }
        throw err;
      }
    }
    if (!sentence) throw new Error('Failed to generate unique sentenceKey after 5 attempts');
    await sentenceQueue.add('process-sentence', {
      sentenceId: sentence.id,
      arabicText: text,
      createdById,
    });
    return sentence;
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
