import { ConflictException, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PinoLogger } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';

import { isValidCategory } from '../../../common/constants/category.constant.js';
import { normalizeArabicText } from '../../../common/utils/normalize-arabic.util.js';
import { DatabaseService } from '../../../database/drizzle/db.service.js';
import * as schema from '../../../database/drizzle/schema.js';
import { AiService } from '../ai.service.js';

const ARABIC_REGEX = /^[\u0600-\u06FF\s]+$/;

@Injectable()
export class AiWordService {
  constructor(
    private readonly db: DatabaseService,
    private readonly aiService: AiService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AiWordService.name);
  }

  async createWordViaAi(input: string, createdById?: string) {
    const text = ARABIC_REGEX.test(input)
      ? input
      : await this.aiService.translateToArabic(input);
    const normalizedText = normalizeArabicText(text);

    let entityRows = await this.db.db
      .select()
      .from(schema.arabicEntity)
      .where(eq(schema.arabicEntity.normalizedText, normalizedText))
      .limit(1);

    let entity = entityRows[0] ?? null;

    if (entity) {
      const existingWordRows = await this.db.db
        .select()
        .from(schema.word)
        .where(eq(schema.word.entityId, entity.id))
        .limit(1);

      if (existingWordRows[0]) return existingWordRows[0];
    }

    const result = await this.aiService.generateContent(text);

    const category = isValidCategory(result.category)
      ? result.category
      : 'GENERAL';
    if (category !== result.category) {
      this.logger.warn(
        `AI returned unknown category "${result.category}" — defaulted to GENERAL.`,
      );
    }

    if (!entity) {
      const createdEntity = await this.db.db
        .insert(schema.arabicEntity)
        .values({
          id: randomUUID(),
          entityKey: `entity-${randomUUID()}`,
          arabicText: text,
          normalizedText,
          pronunciationBangla: result.pronunciationBn,
          pronunciationEnglish: result.pronunciationEn,
          ...(createdById ? { createdById } : {}),
        })
        .returning();

      entity = createdEntity[0] ?? null;
    }

    try {
      const rows = await this.db.db
        .insert(schema.word)
        .values({
          id: randomUUID(),
          wordKey: `word-${randomUUID()}`,
          entityId: entity!.id,
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
          ...(createdById ? { createdById } : {}),
        })
        .returning();

      return rows[0];
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          'This word was just created by another request. Please retry.',
        );
      }
      throw error;
    }
  }
}
