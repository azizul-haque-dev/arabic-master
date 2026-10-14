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

    const sentence = await SentenceRepository.insert({
      id: randomUUIDv7(),
      sentenceKey: `sentence_${randomUUIDv7()}`,
      entityId: entity.id,
      ...fields,
      difficulty: fields.difficulty ?? DifficultyLevel.BEGINNER,
      status: ContentStatus.DRAFT,
      createdById,
    });
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

    let entity =
      await ArabicEntityRepository.findByNormalizedText(normalizedText);
    if (entity) {
      const existing = await SentenceRepository.findByEntityId(entity.id);
      if (existing) return existing;
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
        if (existing) return existing;
      }
    }

    const blank = '';
    const sentence = await SentenceRepository.insert({
      id: randomUUIDv7(),
      sentenceKey: `sentence_${randomUUIDv7()}`,
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
