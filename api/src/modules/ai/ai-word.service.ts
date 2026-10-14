import { v7 as randomUUIDv7 } from 'uuid';
import {
  DEFAULT_CATEGORY,
  isValidCategory,
} from '../../common/constants/category.constant.js';
import { ConflictError } from '../../common/errors/app-error.js';
import type { Logger } from '../../common/http/logger.js';
import { isUniqueViolation } from '../../common/utils/db-error.util.js';
import {
  isArabicText,
  normalizeArabicText,
} from '../../common/utils/normalize-arabic.util.js';
import type { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import type { WordRepository } from '../words/word.repository.js';
import type { AiService } from './ai.service.js';

export function createAiWordService(dependencies: {
  ai: AiService;
  entities: ArabicEntityRepository;
  words: WordRepository;
  logger: Logger;
}) {
  const { ai, entities, words } = dependencies;
  const logger = d.logger.child({ context: 'AiWordService' });

  async function lookup(normalized: string) {
    const entity = await entities.findByNormalizedText(normalized);
    const word = entity ? await words.findByEntityId(entity.id) : null;
    return { entity, word };
  }

  async function createWordViaAi(input: string, createdById?: string) {
    const text = isArabicText(input)
      ? input
      : await ai.translateToArabic(input);
    const normalized = normalizeArabicText(text);

    let { entity, word } = await lookup(normalized);
    if (word) return word;

    const result = await ai.generateContent(text);
    const category = isValidCategory(result.category)
      ? result.category
      : DEFAULT_CATEGORY;
    if (category !== result.category) {
      logger.warn(
        `AI returned unknown category "${result.category}" — defaulted to ${DEFAULT_CATEGORY}.`,
      );
    }

    if (!entity) {
      try {
        entity = await entities.create({
          arabicText: text,
          createdById,
          pronunciationBangla: result.pronunciationBn,
          pronunciationEnglish: result.pronunciationEn,
        });
      } catch (err) {
        if (!isUniqueViolation(err)) throw err;
        ({ entity, word } = await lookup(normalized)); // অন্য request আগে বানিয়ে ফেলেছে
        if (word) return word;
        if (!entity)
          throw new ConflictError(
            'This word was just created by another request. Please retry.',
          );
      }
    }

    try {
      return await words.insert({
        id: randomUUIDv7(),
        wordKey: `word-${randomUUIDv7()}`,
        entityId: entity.id,
        category,
        meaningEn: result.meaningEn,
        meaningBn: result.meaningBn,
        whenToUseEn: result.whenToUseEn,
        whenToUseBn: result.whenToUseBn,
        pronunciationEn: result.pronunciationEn,
        pronunciationBn: result.pronunciationBn,
        feminineEn: result.feminineEn,
        feminineBn: result.feminineBn,
        noteEn: result.noteEn || null,
        noteBn: result.noteBn || null,
        createdById,
      });
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      const raced = await lookup(normalized);
      if (raced.word) return raced.word;
      throw new ConflictError(
        'This word was just created by another request. Please retry.',
      );
    }
  }

  return { createWordViaAi };
}
export type AiWordService = ReturnType<typeof createAiWordService>;
