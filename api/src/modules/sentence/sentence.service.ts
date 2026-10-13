import type { Queue } from 'bullmq';
import { v7 as randomUUIDv7 } from 'uuid';
import { DEFAULT_CATEGORY } from '../../common/constants/category.constant.js';
import { ConflictError, NotFoundError } from '../../common/errors/app-error.js';
import { paginated } from '../../common/http/response.js';
import { isArabicText, normalizeArabicText } from '../../common/utils/normalize-arabic.util.js';
import { withTransaction } from '../../database/db.js';
import { ContentStatus, DifficultyLevel } from '../../database/drizzle/enums.js';
import type { AiService } from '../ai/ai.service.js';
import type { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import type { SentenceRepository } from './sentence.repository.js';
import type { CreateSentenceInput, ListSentenceQuery, UpdateSentenceInput } from './sentence.schemas.js';

type WordLink = { wordId: string; position: number };

export function createSentenceService(d: {
  repo: SentenceRepository; entities: ArabicEntityRepository; ai: AiService; queue: Queue;
}) {
  const { repo, entities, ai, queue } = d;

  async function getById(id: string) {
    const sentence = await repo.findById(id);
    if (!sentence) throw new NotFoundError('Sentence not found');
    return sentence;
  }

  function replaceWords(sentenceId: string, words: WordLink[]) {
    return withTransaction(async (tx) => {
      await repo.replaceWords(sentenceId, words, tx);
      return repo.findById(sentenceId, tx);
    });
  }

  return {
    async list(q: ListSentenceQuery) {
      const { items, total } = await repo.list(q);
      return paginated(items, q.page, q.limit, total);
    },

    getById,

    async create(dto: CreateSentenceInput, createdById: string) {
      const { text, audioUrl, words, ...fields } = dto;

      let entity = await entities.findByNormalizedText(normalizeArabicText(text));
      if (entity) {
        if (await repo.findByEntityId(entity.id)) throw new ConflictError('A sentence already exists for this Arabic text');
      } else {
        entity = await entities.create({ arabicText: text, audioUrl, createdById });
      }

      const sentence = await repo.insert({
        id: randomUUIDv7(), sentenceKey: `sentence_${randomUUIDv7()}`, entityId: entity.id,
        ...fields, difficulty: fields.difficulty ?? DifficultyLevel.BEGINNER,
        status: ContentStatus.DRAFT, createdById,
      });
      return words?.length ? replaceWords(sentence.id, words) : sentence;
    },

    async update(id: string, dto: UpdateSentenceInput) {
      await getById(id);
      // TODO: text/audioUrl আসলে entity-র field; আগের কোডেও ignore হত
      const { words, text: _t, audioUrl: _a, ...rest } = dto;
      const sentence = await repo.update(id, { ...rest, updatedAt: new Date() });
      return words ? replaceWords(id, words) : sentence;
    },

    async remove(id: string) {
      await getById(id);
      await repo.delete(id);
    },

    async generateWithAi(rawText: string, createdById: string) {
      const text = isArabicText(rawText) ? rawText : await ai.translateToArabic(rawText);

      let entity = await entities.findByNormalizedText(normalizeArabicText(text));
      if (entity) {
        const existing = await repo.findByEntityId(entity.id);
        if (existing) return existing;
      } else {
        entity = await entities.create({ arabicText: text, createdById });
      }

      const blank = '';
      const sentence = await repo.insert({
        id: randomUUIDv7(), sentenceKey: `sentence_${randomUUIDv7()}`, entityId: entity.id,
        meaningEn: blank, meaningBn: blank, whenToUseEn: blank, whenToUseBn: blank,
        pronunciationEn: blank, pronunciationBn: blank, feminineEn: blank, feminineBn: blank,
        category: DEFAULT_CATEGORY, difficulty: DifficultyLevel.BEGINNER,
        status: ContentStatus.DRAFT, createdById,
      });
      await queue.add('process-sentence', { sentenceId: sentence.id, arabicText: text, createdById });
      return sentence;
    },

    async resyncWords(id: string) {
      const sentence = await getById(id);
      const entity = await entities.findById(sentence.entityId);
      if (!entity) throw new NotFoundError('Sentence entity not found');
      await queue.add('resync-sentence-words', { sentenceId: sentence.id, arabicText: entity.arabicText });
      return { sentenceId: sentence.id };
    },
  };
}
export type SentenceService = ReturnType<typeof createSentenceService>;
