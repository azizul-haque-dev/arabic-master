import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../database/drizzle/db.service.js';

export function normalizeArabicText(text: string): string {
  return text
    .replace(/[ً-ْ]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

@Injectable()
export class ArabicEntityService {
  constructor(private readonly db: DatabaseService) {}

  findByNormalizedText(text: string) {
    return this.db.arabicEntity.findUnique({
      where: { normalizedText: normalizeArabicText(text) },
    });
  }

  create(data: { arabicText: string; audioUrl?: string; createdById?: string; }) {
    return this.db.arabicEntity.create({
      data: {
        entityKey: `entity_${randomUUID()}`,
        arabicText: data.arabicText,
        normalizedText: normalizeArabicText(data.arabicText),
        audioUrl: data.audioUrl,
        pronunciationBangla: '',
        pronunciationEnglish: '',
        createdById: data.createdById,
      },
    });
  }

  updateAiPronunciation(id: string, data: { pronunciationBangla: string; pronunciationEnglish: string }) {
    return this.db.arabicEntity.update({ where: { id }, data });
  }
}
