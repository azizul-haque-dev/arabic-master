import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { isValidCategory } from '../../../common/constant/category.constant.js';
import { normalizeArabicText } from '../../../common/utils/normalize-arabic.util.js';
import { PrismaService } from '../../../database/prisma.service.js';
import { WORD_INCLUDE } from '../../word/word.repository.js';
import { AiService } from '../ai.service.js';

const ARABIC_REGEX = /^[\u0600-\u06FF\s]+$/;

@Injectable()
export class AiWordService {
  private readonly logger = new Logger(AiWordService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async createWordViaAi(input: string, createdById?: string) {
    const text = ARABIC_REGEX.test(input)
      ? input
      : await this.aiService.translateToArabic(input);
    const normalizedText = normalizeArabicText(text);

    let entity = await this.prisma.arabicEntity.findUnique({
      where: { normalizedText },
    });

    if (entity) {
      const existingWord = await this.prisma.word.findFirst({
        where: { entityId: entity.id },
        include: WORD_INCLUDE,
      });
      if (existingWord) return existingWord;
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

    // Entity na thakle age eta create koro — shudhu scalar fields, tai kono
    // checked/unchecked mixing issue nai.
    if (!entity) {
      entity = await this.prisma.arabicEntity.create({
        data: {
          entityKey: `entity-${randomUUID()}`,
          arabicText: text,
          normalizedText,
          pronunciationBangla: result.pronunciationBn,
          pronunciationEnglish: result.pronunciationEn,
          ...(createdById ? { createdById } : {}),
        },
      });
    }

    try {
      return await this.prisma.word.create({
        data: {
          wordKey: `word-${randomUUID()}`,
          entityId: entity.id, // <-- scalar FK, relational `entity: {...}` na
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
        },
        include: WORD_INCLUDE,
      });
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
