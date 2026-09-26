import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service.js';

// Strips Arabic diacritics (the little marks above/below letters) and
// squashes extra spaces, so "كَتَبَ" and "كتب" count as the SAME word.
// This is what makes normalizedText a reliable dedup key.
export function normalizeArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u0652]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

@Injectable()
export class ArabicEntityService {
  constructor(private readonly prisma: PrismaService) {}

  findByNormalizedText(text: string) {
    return this.prisma.arabicEntity.findUnique({
      where: { normalizedText: normalizeArabicText(text) },
    });
  }

  create(data: {
    arabicText: string;
    audioUrl?: string;
    createdById?: string;
  }) {
    return this.prisma.arabicEntity.create({
      data: {
        entityKey: `entity_${randomUUID()}`,
        arabicText: data.arabicText,
        normalizedText: normalizeArabicText(data.arabicText),
        audioUrl: data.audioUrl,
        // Placeholder until the AI job fills in the real pronunciation —
        // see word.processor.ts in §6.
        pronunciationBangla: '',
        pronunciationEnglish: '',
        createdById: data.createdById,
      },
    });
  }

  updateAiPronunciation(
    id: string,
    data: { pronunciationBangla: string; pronunciationEnglish: string },
  ) {
    return this.prisma.arabicEntity.update({ where: { id }, data });
  }
}
