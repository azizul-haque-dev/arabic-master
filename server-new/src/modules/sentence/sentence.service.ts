import { InjectQueue } from '@nestjs/bullmq';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { randomUUID } from 'node:crypto';
import { SentenceRepository } from './sentence.repository.js';

import { SENTENCE_QUEUE_NAME } from '../../config/constants.js';
import {
  ContentStatus,
  DifficultyLevel,
} from '../../generated/prisma/enums.js';
import { AiService } from '../ai/ai.service.js';
import { ArabicEntityService } from '../arabic-entities/arabic-entities.service.js';
import { CreateSentenceDto } from './dto/create-sentence.dto.js';
import { ListSentenceQueryDto } from './dto/list-sentence-query.dto.js';
import { UpdateSentenceDto } from './dto/update-sentence.dto.js';

const ARABIC_REGEX = /^[\u0600-\u06FF\s]+$/;

@Injectable()
export class SentenceService {
  constructor(
    private readonly sentenceRepository: SentenceRepository,
    private readonly arabicEntityService: ArabicEntityService,
    private readonly aiService: AiService,
    @InjectQueue(SENTENCE_QUEUE_NAME) private readonly sentenceQueue: Queue,
  ) {}

  async list(query: ListSentenceQueryDto) {
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
      this.sentenceRepository.findMany(where, (page - 1) * limit, limit),
      this.sentenceRepository.count(where),
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
    const sentence = await this.sentenceRepository.findById(id);
    if (!sentence) throw new NotFoundException('Sentence not found');
    return sentence;
  }

  async create(dto: CreateSentenceDto, createdById: string) {
    let entity = await this.arabicEntityService.findByNormalizedText(dto.text);

    if (!entity) {
      entity = await this.arabicEntityService.create({
        arabicText: dto.text,
        audioUrl: dto.audioUrl,
        createdById,
      });
    } else {
      const existingSentence =
        await this.sentenceRepository.findFirstByEntityId(entity.id);
      if (existingSentence)
        throw new ConflictException(
          'A sentence already exists for this Arabic text',
        );
    }

    const sentence = await this.sentenceRepository.create(entity.id, {
      sentenceKey: `sentence_${randomUUID()}`,
      meaningEn: dto.meaningEn,
      meaningBn: dto.meaningBn,
      whenToUseEn: dto.whenToUseEn,
      whenToUseBn: dto.whenToUseBn,
      pronunciationEn: dto.pronunciationEn,
      pronunciationBn: dto.pronunciationBn,
      feminineEn: dto.feminineEn,
      feminineBn: dto.feminineBn,
      category: dto.category,
      difficulty: dto.difficulty ?? DifficultyLevel.BEGINNER,
      relatedWordId: dto.relatedWordId,
      noteEn: dto.noteEn,
      noteBn: dto.noteBn,
      status: ContentStatus.DRAFT,
      createdById,
    });

    if (dto.words?.length) {
      return this.sentenceRepository.replaceWords(sentence.id, dto.words);
    }
    return sentence;
  }

  async update(id: string, dto: UpdateSentenceDto) {
    await this.getById(id);
    const { words, ...rest } = dto;
    const sentence = await this.sentenceRepository.update(id, rest);
    if (words) return this.sentenceRepository.replaceWords(id, words);
    return sentence;
  }

  async remove(id: string) {
    const sentence = await this.getById(id);
    await this.sentenceRepository.delete(sentence.id);
  }

  // AI create — async, queue-based, same pattern as Word.
  async generateWithAi(rawText: string, createdById: string) {
    const text = ARABIC_REGEX.test(rawText)
      ? rawText
      : await this.aiService.translateToArabic(rawText);

    let entity = await this.arabicEntityService.findByNormalizedText(text);

    if (entity) {
      const existingSentence =
        await this.sentenceRepository.findFirstByEntityId(entity.id);
      if (existingSentence) return existingSentence;
    } else {
      entity = await this.arabicEntityService.create({
        arabicText: text,
        createdById,
      });
    }

    const placeholder = '';
    const sentence = await this.sentenceRepository.create(entity.id, {
      sentenceKey: `sentence_${randomUUID()}`,
      meaningEn: placeholder,
      meaningBn: placeholder,
      whenToUseEn: placeholder,
      whenToUseBn: placeholder,
      pronunciationEn: placeholder,
      pronunciationBn: placeholder,
      feminineEn: placeholder,
      feminineBn: placeholder,
      category: 'GENERAL',
      difficulty: DifficultyLevel.BEGINNER,
      status: ContentStatus.DRAFT,
      createdById,
    });

    await this.sentenceQueue.add('process-sentence', {
      sentenceId: sentence.id,
      arabicText: text,
      createdById,
    });
    return sentence;
  }

  // Re-splits the sentence's text and relinks its words only — meaning/
  // whenToUse/category untouched. Same as the old resync path.
  async resyncWords(id: string) {
    const sentence = await this.getById(id);
    await this.sentenceQueue.add('resync-sentence-words', {
      sentenceId: sentence.id,
      arabicText: sentence.entity.arabicText,
    });
    return { sentenceId: sentence.id };
  }
}
