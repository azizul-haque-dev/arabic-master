import type { Queue } from 'bullmq';
import { randomUUIDv7 } from 'node:crypto';
import { DEFAULT_CATEGORY } from '../../common/constants/category.constant.js';
import { ConflictError, NotFoundError } from '../../common/errors/app-error.js';
import { paginated } from '../../common/http/response.js';
import { isUniqueViolation } from '../../common/utils/db-error.util.js';
import { isArabicText, normalizeArabicText } from '../../common/utils/normalize-arabic.util.js';
import { ContentStatus, WordType } from '../../database/drizzle/enums.js';
import type { AiService } from '../ai/ai.service.js';
import type { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import type { CreateWordInput, ListWordQuery, UpdateWordInput } from './word.schemas.js';
import type { WordRepository } from './word.repository.js';

export function createWordService(d: {
  repo: WordRepository; entities: ArabicEntityRepository; ai: AiService; queue: Queue;
}) {
  const { repo, entities, ai, queue } = d;

  async function getById(id: string) {
    const word = await repo.findDetailedById(id);
    if (!word) throw new NotFoundError('Word not found');
    return word;
  }

  return {
    async list(q: ListWordQuery) {
      const { items, total } = await repo.list(q);
      return paginated(items, q.page, q.limit, total);
    },

    getById,

    async create(dto: CreateWordInput, createdById: string) {
      const { text, audioUrl, ...fields } = dto;
      let entity = await entities.findByNormalizedText(normalizeArabicText(text));
      if (entity) {
        if (await repo.findByEntityId(entity.id)) throw new ConflictError('A word already exists for this Arabic text');
      } else {
        entity = await entities.create({ arabicText: text, audioUrl, createdById });
      }
      return repo.insert({
        id: randomUUIDv7(), wordKey: `word_${randomUUIDv7()}`, entityId: entity.id,
        ...fields, wordType: fields.wordType ?? WordType.OTHER,
        status: ContentStatus.DRAFT, createdById,
      });
    },

    async update(id: string, dto: UpdateWordInput) {
      await getById(id);
      // TODO: text/audioUrl আসলে entity-র field; আগের কোডেও ignore হত
      const { text: _t, audioUrl: _a, ...rest } = dto;
      return repo.update(id, { ...rest, updatedAt: new Date() });
    },

    async remove(id: string) {
      await getById(id);
      await repo.delete(id);
    },

    async generateWithAi(rawText: string, createdById: string) {
      const text = isArabicText(rawText) ? rawText : await ai.translateToArabic(rawText);
      const normalized = normalizeArabicText(text);

      let entity = await entities.findByNormalizedText(normalized);
      if (entity) {
        const existing = await repo.findByEntityId(entity.id);
        if (existing) return existing;
      } else {
        try {
          entity = await entities.create({ arabicText: text, createdById });
        } catch (err) {
          if (!isUniqueViolation(err)) throw err;
          entity = await entities.findByNormalizedText(normalized);
          if (!entity) throw err;
          const existing = await repo.findByEntityId(entity.id);
          if (existing) return existing;
        }
      }

      const blank = '';
      const word = await repo.insert({
        id: randomUUIDv7(), wordKey: `word_${randomUUIDv7()}`, entityId: entity.id,
        meaningEn: blank, meaningBn: blank, whenToUseEn: blank, whenToUseBn: blank,
        pronunciationEn: blank, pronunciationBn: blank, feminineEn: blank, feminineBn: blank,
        category: DEFAULT_CATEGORY, status: ContentStatus.DRAFT, createdById,
      });
      await queue.add('process-word', { wordId: word.id, arabicText: text });
      return word;
    },
  };
}
export type WordService = ReturnType<typeof createWordService>;
