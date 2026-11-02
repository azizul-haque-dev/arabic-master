import { v7 as randomUUIDv7 } from 'uuid';
import {
  DEFAULT_CATEGORY,
  isValidCategory,
} from '../../common/constants/category.constant.js';
import { ConflictError } from '../../common/errors/app-error.js';
import type { Logger } from '../../common/http/logger.js';
import { logger as defaultLogger } from '../../common/http/logger.js';
import { isUniqueViolation } from '../../common/utils/db-error.util.js';
import {
  isArabicText,
  normalizeArabicText,
} from '../../common/utils/normalize-arabic.util.js';
import { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import { WordRepository } from '../words/word.repository.js';
import { AiService } from './ai.service.js';

export function createAiWordService(dependencies: {
  ai: AiService;
  entities: ArabicEntityRepository;
  words: WordRepository;
  logger: Logger;
}) {
  const { ai, entities, words } = dependencies;
  const logger = dependencies.logger.child({ context: 'AiWordService' });

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

    let attempts = 0;
    while (attempts < 5) {
      try {
        const wordKey = await words.generateNextWordKey(attempts);
        return await words.insert({
          id: randomUUIDv7(),
          wordKey,
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
        const pgErr = err as { code?: string; constraint?: string };
        if (pgErr?.code === '23505' && pgErr?.constraint?.includes('wordKey')) {
          attempts++;
          continue;
        }
        if (!isUniqueViolation(err)) throw err;
        const raced = await lookup(normalized);
        if (raced.word) return raced.word;
        throw new ConflictError(
          'This word was just created by another request. Please retry.',
        );
      }
    }
    throw new Error('Failed to generate unique wordKey after 5 attempts');
  }

  async function resolveWordWithAi(input: string, createdById?: string) {
    const text = isArabicText(input)
      ? input
      : await ai.translateToArabic(input);
    const normalized = normalizeArabicText(text);

    const { word } = await lookup(normalized);
    if (word) {
      return { word, createdViaAi: false };
    }

    // Pass `text` (already translated to Arabic) so createWordViaAi does not translate a second time
    const created = await createWordViaAi(text, createdById);
    return { word: created, createdViaAi: true };
  }

  return { createWordViaAi, resolveWordWithAi };
}

let defaultAiWordService: ReturnType<typeof createAiWordService> | undefined;

function getAiWordService() {
  defaultAiWordService ??= createAiWordService({
    ai: AiService,
    entities: ArabicEntityRepository,
    words: WordRepository,
    logger: defaultLogger,
  });
  return defaultAiWordService;
}

export const AiWordService = {
  createWordViaAi: (input: string, createdById?: string) =>
    getAiWordService().createWordViaAi(input, createdById),
  resolveWordWithAi: (input: string, createdById?: string) =>
    getAiWordService().resolveWordWithAi(input, createdById),
};

export type AiWordService = typeof AiWordService;
