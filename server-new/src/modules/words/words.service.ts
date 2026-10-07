import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  or,
} from 'drizzle-orm';
import { Queue } from 'bullmq';
import { randomUUID } from 'node:crypto';
import { DEFAULT_CATEGORY } from '../../common/constants/category.constant.js';
import { isUniqueViolation } from '../../common/utils/db-error.util.js';
import { AiService } from '../ai/ai.service.js';
import { ArabicEntityService } from '../arabic-entities/arabic-entities.service.js';
import { WORD_QUEUE_NAME } from '../../config/constants.js';
import { DatabaseService } from '../../database/drizzle/db.service.js';
import { ContentStatus, WordType } from '../../database/drizzle/enums.js';
import * as schema from '../../database/drizzle/schema.js';
import { normalizeArabicText } from '../../common/utils/normalize-arabic.util.js';
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
    const conditions = [];
    if (category) conditions.push(eq(schema.word.category, category));
    if (status) conditions.push(eq(schema.word.status, status));
    if (search) {
      const escaped = search.replace(/[\\%_]/g, '\\$&');
      const pattern = `%${escaped}%`;
      const normalizedPattern = `%${normalizeArabicText(search).replace(/[\\%_]/g, '\\$&')}%`;
      const searchCondition = or(
        ilike(schema.arabicEntity.arabicText, pattern),
        ilike(schema.arabicEntity.normalizedText, normalizedPattern),
        ilike(schema.word.meaningEn, pattern),
        ilike(schema.word.meaningBn, pattern),
      );
      if (searchCondition) conditions.push(searchCondition);
    }
    const condition = and(...conditions);
    const [countRows, items] = await Promise.all([
      this.db.db
        .select({ count: count() })
        .from(schema.word)
        .innerJoin(
          schema.arabicEntity,
          eq(schema.word.entityId, schema.arabicEntity.id),
        )
        .where(condition),
      this.db.db
        .select({
          ...getTableColumns(schema.word),
          entity: {
            arabicText: schema.arabicEntity.arabicText,
            audioUrl: schema.arabicEntity.audioUrl,
            normalizedText: schema.arabicEntity.normalizedText,
          },
        })
        .from(schema.word)
        .innerJoin(
          schema.arabicEntity,
          eq(schema.word.entityId, schema.arabicEntity.id),
        )
        .where(condition)
        .orderBy(desc(schema.word.createdAt), desc(schema.word.id))
        .offset((page - 1) * limit)
        .limit(limit),
    ]);
    const total = Number(countRows[0]?.count ?? 0);

    return { items, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
  }

  async getById(id: string) {
    const rows = await this.db.db
      .select({
        ...getTableColumns(schema.word),
        arabicText: schema.arabicEntity.arabicText,
        entity: {
          arabicText: schema.arabicEntity.arabicText,
          audioUrl: schema.arabicEntity.audioUrl,
          normalizedText: schema.arabicEntity.normalizedText,
        },
      })
      .from(schema.word)
      .innerJoin(
        schema.arabicEntity,
        eq(schema.word.entityId, schema.arabicEntity.id),
      )
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
      } catch (error) {
        if (isUniqueViolation(error)) {
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
        category: DEFAULT_CATEGORY,
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
