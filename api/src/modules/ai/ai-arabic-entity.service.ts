import { ConflictError } from '../../common/errors/app-error.js';
import { isUniqueViolation } from '../../common/utils/db-error.util.js';
import {
  isArabicText,
  normalizeArabicText,
} from '../../common/utils/normalize-arabic.util.js';
import { defaultContentStatus } from '../../common/utils/content-workflow.util.js';
import { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import type { ArabicEntityRepository as ArabicEntityRepositoryType } from '../arabic-entities/arabic-entity.repository.js';
import type { RequestUser } from '../auth/auth.types.js';
import { AiService } from './ai.service.js';
import type { AiService as AiServiceType } from './ai.service.js';

type Entity = NonNullable<
  Awaited<ReturnType<ArabicEntityRepositoryType['findByNormalizedText']>>
>;

export type ArabicEntityGenerationResult = {
  entity: Entity;
  created: boolean;
};

export type ArabicEntityGenerationBatchResult =
  | ({ query: string; success: true } & ArabicEntityGenerationResult)
  | { query: string; success: false; error: string };

export function createAiArabicEntityService(dependencies: {
  ai: AiServiceType;
  entities: ArabicEntityRepositoryType;
}) {
  const { ai, entities } = dependencies;

  async function generateWithAi(
    query: string,
    actor: RequestUser,
  ): Promise<ArabicEntityGenerationResult> {
    const arabicText = isArabicText(query)
      ? query
      : await ai.translateToArabic(query);
    const normalizedText = normalizeArabicText(arabicText);

    const existing = await entities.findByNormalizedText(normalizedText);
    if (existing) return { entity: existing, created: false };

    const generated = await ai.generateContent(arabicText);
    try {
      const entity = await entities.create({
        arabicText,
        meaningBangla: generated.meaningBn,
        meaningEnglish: generated.meaningEn,
        pronunciationBangla: generated.pronunciationBn,
        pronunciationEnglish: generated.pronunciationEn,
        status: defaultContentStatus(actor.role),
        createdById: actor.userId,
      });
      return { entity, created: true };
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;

      const raced = await entities.findByNormalizedText(normalizedText);
      if (raced) return { entity: raced, created: false };
      throw new ConflictError(
        'This Arabic entity was created concurrently. Please retry.',
      );
    }
  }

  async function generateManyWithAi(
    queries: string[],
    actor: RequestUser,
  ): Promise<ArabicEntityGenerationBatchResult[]> {
    const results: ArabicEntityGenerationBatchResult[] = [];

    for (let index = 0; index < queries.length; index += 3) {
      const chunk = queries.slice(index, index + 3);
      const chunkResults = await Promise.all(
        chunk.map(async (query): Promise<ArabicEntityGenerationBatchResult> => {
          try {
            return {
              query,
              success: true,
              ...(await generateWithAi(query, actor)),
            };
          } catch (error) {
            return {
              query,
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Unable to generate Arabic entity.',
            };
          }
        }),
      );
      results.push(...chunkResults);
    }

    return results;
  }

  return { generateWithAi, generateManyWithAi };
}

let defaultAiArabicEntityService:
  | ReturnType<typeof createAiArabicEntityService>
  | undefined;

function getAiArabicEntityService() {
  defaultAiArabicEntityService ??= createAiArabicEntityService({
    ai: AiService,
    entities: ArabicEntityRepository,
  });
  return defaultAiArabicEntityService;
}

export const AiArabicEntityService = {
  generateWithAi: (query: string, actor: RequestUser) =>
    getAiArabicEntityService().generateWithAi(query, actor),
  generateManyWithAi: (queries: string[], actor: RequestUser) =>
    getAiArabicEntityService().generateManyWithAi(queries, actor),
};

