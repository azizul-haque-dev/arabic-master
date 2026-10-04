import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../database/drizzle/db.service.js';
import * as schema from '../../database/drizzle/schema.js';

export function normalizeArabicText(text: string): string {
  return text
    .replace(/[ً-ْ]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

@Injectable()
export class ArabicEntityService {
  constructor(private readonly db: DatabaseService) {}

  async findByNormalizedText(text: string) {
    const rows = await this.db.db
      .select()
      .from(schema.arabicEntity)
      .where(eq(schema.arabicEntity.normalizedText, normalizeArabicText(text)))
      .limit(1);

    return rows[0] ?? null;
  }

  async findById(id: string) {
    const rows = await this.db.db
      .select()
      .from(schema.arabicEntity)
      .where(eq(schema.arabicEntity.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async create(data: { arabicText: string; audioUrl?: string; createdById?: string; }) {
    const rows = await this.db.db.insert(schema.arabicEntity).values({
      id: randomUUID(),
      entityKey: `entity_${randomUUID()}`,
      arabicText: data.arabicText,
      normalizedText: normalizeArabicText(data.arabicText),
      audioUrl: data.audioUrl,
      pronunciationBangla: '',
      pronunciationEnglish: '',
      createdById: data.createdById,
    }).returning();

    return rows[0] ?? null;
  }

  async updateAiPronunciation(id: string, data: { pronunciationBangla: string; pronunciationEnglish: string }) {
    const rows = await this.db.db
      .update(schema.arabicEntity)
      .set(data)
      .where(eq(schema.arabicEntity.id, id))
      .returning();

    return rows[0] ?? null;
  }
}
