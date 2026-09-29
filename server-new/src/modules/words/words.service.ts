import { InjectQueue } from '@nestjs/bullmq';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { randomUUID } from 'node:crypto';
import { AiService } from '../ai/ai.service.js';
import { ArabicEntityService } from '../arabic-entities/arabic-entities.service.js';
import { CreateWordDto } from './dto/create-word.dto.js';
import { UpdateWordDto } from './dto/update-word.dto.js';
import { WordRepository } from './words.repository.js';

import { WORD_QUEUE_NAME } from '../../config/constants.js';
import { ContentStatus, WordType } from '../../generated/prisma/enums.js';
import { ListWordQueryDto } from './dto/list-word-query.dto.js';

const ARABIC_REGEX = /^[\u0600-\u06FF\s]+$/;

@Injectable()
export class WordService {
  constructor(
    private readonly wordRepository: WordRepository,
    private readonly arabicEntityService: ArabicEntityService,
    private readonly aiService: AiService,
    @InjectQueue(WORD_QUEUE_NAME) private readonly wordQueue: Queue,
  ) {}

  async list(query: ListWordQueryDto) {
    const { page, limit, category, status, search } = query;
    const where = {
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              {
                entity: {
                  arabicText: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              },
              { meaningEn: { contains: search, mode: 'insensitive' as const } },
              { meaningBn: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.wordRepository.findMany(where, (page - 1) * limit, limit),
      this.wordRepository.count(where),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getById(id: string) {
    const word = await this.wordRepository.findById(id);
    if (!word) throw new NotFoundException('Word not found');
    return word;
  }

  async create(dto: CreateWordDto, createdById: string) {
    let entity = await this.arabicEntityService.findByNormalizedText(dto.text);

    if (!entity) {
      entity = await this.arabicEntityService.create({
        arabicText: dto.text,
        audioUrl: dto.audioUrl,
        createdById,
      });
    } else {
      const existingWord = await this.wordRepository.findFirstByEntityId(
        entity.id,
      );
      if (existingWord)
        throw new ConflictException(
          'A word already exists for this Arabic text',
        );
    }

    return this.wordRepository.create(entity.id, {
      wordKey: `word_${randomUUID()}`,
      meaningEn: dto.meaningEn,
      meaningBn: dto.meaningBn,
      whenToUseEn: dto.whenToUseEn,
      whenToUseBn: dto.whenToUseBn,
      pronunciationEn: dto.pronunciationEn,
      pronunciationBn: dto.pronunciationBn,
      feminineEn: dto.feminineEn,
      feminineBn: dto.feminineBn,
      wordType: dto.wordType ?? WordType.OTHER,
      category: dto.category,
      noteEn: dto.noteEn,
      noteBn: dto.noteBn,
      status: ContentStatus.DRAFT,
      createdById,
    });
  }

  async update(id: string, dto: UpdateWordDto) {
    await this.getById(id);
    return this.wordRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.wordRepository.delete(id);
  }

  // AI create — async, queue-based path.
  // 1. Arabic na hole translate koro
  // 2. Entity find-or-create (dedup)
  // 3. Placeholder Word immediately create koro, API instant response dey
  // 4. Queue-e job push koro — WordProcessor ta pore fill korbe
  async generateWithAi(rawText: string, createdById: string) {
    const text = ARABIC_REGEX.test(rawText)
      ? rawText
      : await this.aiService.translateToArabic(rawText);

    let entity = await this.arabicEntityService.findByNormalizedText(text);

    if (entity) {
      const existingWord = await this.wordRepository.findFirstByEntityId(
        entity.id,
      );
      if (existingWord) return existingWord; // already generated — abar kaj koro na
    } else {
      try {
        entity = await this.arabicEntityService.create({
          arabicText: text,
          createdById,
        });
      } catch (error: any) {
        // Race condition: eki shomoy e du'ta request eki word-er jonno entity create korte gele
        if (error?.code === 'P2002') {
          entity = await this.arabicEntityService.findByNormalizedText(text);
          if (!entity) throw error;
          const existingWord = await this.wordRepository.findFirstByEntityId(
            entity.id,
          );
          if (existingWord) return existingWord;
        } else {
          throw error;
        }
      }
    }

    const placeholder = '';
    const word = await this.wordRepository.create(entity.id, {
      wordKey: `word_${randomUUID()}`,
      meaningEn: placeholder,
      meaningBn: placeholder,
      whenToUseEn: placeholder,
      whenToUseBn: placeholder,
      pronunciationEn: placeholder,
      pronunciationBn: placeholder,
      feminineEn: placeholder,
      feminineBn: placeholder,
      category: 'GENERAL',
      status: ContentStatus.DRAFT,
      createdById,
    });

    await this.wordQueue.add('process-word', {
      wordId: word.id,
      arabicText: text,
    });
    return word;
  }
}
