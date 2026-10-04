import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { count, eq } from 'drizzle-orm';
import { Queue } from 'bullmq';
import { randomUUID } from 'node:crypto';
import { AiService } from '../ai/ai.service.js';
import { ArabicEntityService } from '../arabic-entities/arabic-entities.service.js';
import { WORD_QUEUE_NAME } from '../../config/constants.js';
import { DatabaseService } from '../../database/drizzle/db.service.js';
import { ContentStatus, WordType } from '../../database/drizzle/enums.js';
import * as schema from '../../database/drizzle/schema.js';
import { normalizeWhere } from '../../database/drizzle/query.utils.js';
import { CreateWordDto } from './dto/create-word.dto.js';
import { ListWordQueryDto } from './dto/list-word-query.dto.js';
import { UpdateWordDto } from './dto/update-word.dto.js';

const ARABIC_REGEX = /^[؀-ۿ\s]+$/;

@Injectable()
export class WordService {
  constructor(
    private readonly db: DatabaseService,
    private readonly arabicEntityService: ArabicEntityService,
    private readonly aiService: AiService,
    @InjectQueue(WORD_QUEUE_NAME) private readonly wordQueue: Queue,
  ) {}

  async list(query: ListWordQueryDto) {
    const { page, limit, category, status, search } = query;
    const where = {
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ entity: { arabicText: { contains: search, mode: 'insensitive' as const } } }, { meaningEn: { contains: search, mode: 'insensitive' as const } }, { meaningBn: { contains: search, mode: 'insensitive' as const } }] } : {}),
    };
    const condition = normalizeWhere(schema.word, where);
    const queryBuilder = this.db.db
      .select()
      .from(schema.word)
      .offset((page - 1) * limit)
      .limit(limit);
    const [countRows, items] = await Promise.all([
      this.db.db
        .select({ count: count() })
        .from(schema.word)
        .where(condition ?? undefined),
      condition ? queryBuilder.where(condition) : queryBuilder,
    ]);
    const total = Number(countRows[0]?.count ?? 0);

    return { items, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
  }

  async getById(id: string) {
    const rows = await this.db.db
      .select()
      .from(schema.word)
      .where(eq(schema.word.id, id))
      .limit(1);
    const word = rows[0] ?? null;
    if (!word) throw new NotFoundException('Word not found');
    return word;
  }

  async create(dto: CreateWordDto, createdById: string) {
    let entity = await this.arabicEntityService.findByNormalizedText(dto.text);

    if (!entity) {
      entity = await this.arabicEntityService.create({ arabicText: dto.text, audioUrl: dto.audioUrl, createdById });
    } else {
      const rows = await this.db.db
        .select()
        .from(schema.word)
        .where(eq(schema.word.entityId, entity.id))
        .limit(1);
      const existingWord = rows[0] ?? null;
      if (existingWord) throw new ConflictException('A word already exists for this Arabic text');
    }

    const rows = await this.db.db
      .insert(schema.word)
      .values({
        id: randomUUID(),
        entityId: entity.id,
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
      })
      .returning();

    return rows[0] ?? null;
  }

  async update(id: string, dto: UpdateWordDto) {
    await this.getById(id);
    const rows = await this.db.db
      .update(schema.word)
      .set(dto)
      .where(eq(schema.word.id, id))
      .returning();
    return rows[0] ?? null;
  }

  async remove(id: string) {
    await this.getById(id);
    await this.db.db.delete(schema.word).where(eq(schema.word.id, id));
  }

  async generateWithAi(rawText: string, createdById: string) {
    const text = ARABIC_REGEX.test(rawText) ? rawText : await this.aiService.translateToArabic(rawText);
    let entity = await this.arabicEntityService.findByNormalizedText(text);

    if (entity) {
      const existingRows = await this.db.db
        .select()
        .from(schema.word)
        .where(eq(schema.word.entityId, entity.id))
        .limit(1);
      const existingWord = existingRows[0] ?? null;
      if (existingWord) return existingWord;
    } else {
      try {
        entity = await this.arabicEntityService.create({ arabicText: text, createdById });
      } catch (error: any) {
        if (error?.code === 'P2002') {
          entity = await this.arabicEntityService.findByNormalizedText(text);
          if (!entity) throw error;
          const existingRows = await this.db.db
            .select()
            .from(schema.word)
            .where(eq(schema.word.entityId, entity.id))
            .limit(1);
          const existingWord = existingRows[0] ?? null;
          if (existingWord) return existingWord;
        } else {
          throw error;
        }
      }
    }

    const placeholder = '';
    const rows = await this.db.db
      .insert(schema.word)
      .values({
        id: randomUUID(),
        entityId: entity.id,
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
      })
      .returning();
    const word = rows[0] ?? null;
    if (!word) throw new Error('Failed to create word');

    await this.wordQueue.add('process-word', { wordId: word.id, arabicText: text });
    return word;
  }
}
