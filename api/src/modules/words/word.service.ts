import type { Queue } from 'bullmq';
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
import type { AiService } from '../ai/ai.service.js';
import type { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import type {
  CreateWordInput,
  ListWordQuery,
  UpdateWordInput,
} from './word.schemas.js';
import type { WordRepository } from './word.repository.js';

export function createWordService(dependencies: {
  repo: WordRepository;
  entities: ArabicEntityRepository;
  ai: AiService;
  queue: Queue;
}) {
  const { repo, entities, ai, queue } = dependencies;

  async function getById(id: string) {
    const word = await repo.findDetailedById(id);
    if (!word) throw new NotFoundError('Word not found');
    return word;
  }

  return {
    async list(query: ListWordQuery) {
      const { items, total } = await repo.list(query);
      return paginated(items, query.page, query.limit, total);
    },

    getById,

    async create(input: CreateWordInput, createdById: string) {
      const { text, audioUrl, ...fields } = input;
      let entity = await entities.findByNormalizedText(
        normalizeArabicText(text),
      );

      if (entity) {
        if (await repo.findByEntityId(entity.id)) {
          throw new ConflictError('A word already exists for this Arabic text');
        }
      } else {
        entity = await entities.create({
          arabicText: text,
          audioUrl,
          createdById,
        });
      }

      return repo.insert({
        id: randomUUIDv7(),
        wordKey: `word_${randomUUIDv7()}`,
        entityId: entity.id,
        ...fields,
        wordType: fields.wordType ?? WordType.OTHER,
        status: ContentStatus.DRAFT,
        createdById,
      });
    },

    async update(id: string, input: UpdateWordInput) {
      await getById(id);
      const { text: _text, audioUrl: _audioUrl, ...wordFields } = input;
      return repo.update(id, { ...wordFields, updatedAt: new Date() });
    },

    async remove(id: string) {
      await getById(id);
      await repo.delete(id);
    },

    async generateWithAi(rawText: string, createdById: string) {
      const text = isArabicText(rawText)
        ? rawText
        : await ai.translateToArabic(rawText);
      const normalizedText = normalizeArabicText(text);

      let entity = await entities.findByNormalizedText(normalizedText);
      if (entity) {
        const existingWord = await repo.findByEntityId(entity.id);
        if (existingWord) return existingWord;
      } else {
        try {
          entity = await entities.create({ arabicText: text, createdById });
        } catch (error) {
          if (!isUniqueViolation(error)) throw error;
          entity = await entities.findByNormalizedText(normalizedText);
          if (!entity) throw error;

          const existingWord = await repo.findByEntityId(entity.id);
          if (existingWord) return existingWord;
        }
      }

      const empty = '';
      const word = await repo.insert({
        id: randomUUIDv7(),
        wordKey: `word_${randomUUIDv7()}`,
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

      await queue.add('process-word', { wordId: word.id, arabicText: text });
      return word;
    },
  };
}

export type WordService = ReturnType<typeof createWordService>;
