import { InjectQueue } from '@nestjs/bullmq';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
import { SENTENCE_QUEUE_NAME } from '../../config/constants.js';
import { DatabaseService } from '../../database/drizzle/db.service.js';
import { ContentStatus, DifficultyLevel } from '../../database/drizzle/enums.js';
import * as schema from '../../database/drizzle/schema.js';
import { normalizeArabicText } from '../../common/utils/normalize-arabic.util.js';
import { AiService } from '../ai/ai.service.js';
import { ArabicEntityService } from '../arabic-entities/arabic-entities.service.js';
import { CreateSentenceDto } from './dto/create-sentence.dto.js';
import { ListSentenceQueryDto } from './dto/list-sentence-query.dto.js';
import { UpdateSentenceDto } from './dto/update-sentence.dto.js';

const ARABIC_REGEX = /^[؀-ۿ\s]+$/;

@Injectable()
export class SentenceService {
  constructor(
    private readonly db: DatabaseService,
    private readonly arabicEntityService: ArabicEntityService,
    private readonly aiService: AiService,
    @InjectQueue(SENTENCE_QUEUE_NAME) private readonly sentenceQueue: Queue,
  ) {}

  async list(query: ListSentenceQueryDto) {
    const { page, limit, category, status, search } = query;
    const conditions = [];
    if (category) conditions.push(eq(schema.sentence.category, category));
    if (status) conditions.push(eq(schema.sentence.status, status));
    if (search) {
      const escaped = search.replace(/[\\%_]/g, '\\$&');
      const pattern = `%${escaped}%`;
      const normalizedPattern = `%${normalizeArabicText(search).replace(/[\\%_]/g, '\\$&')}%`;
      const searchCondition = or(
        ilike(schema.arabicEntity.arabicText, pattern),
        ilike(schema.arabicEntity.normalizedText, normalizedPattern),
        ilike(schema.sentence.meaningEn, pattern),
        ilike(schema.sentence.meaningBn, pattern),
      );
      if (searchCondition) conditions.push(searchCondition);
    }
    const condition = and(...conditions);
    const [countRows, items] = await Promise.all([
      this.db.db
        .select({ count: count() })
        .from(schema.sentence)
        .innerJoin(
          schema.arabicEntity,
          eq(schema.sentence.entityId, schema.arabicEntity.id),
        )
        .where(condition),
      this.db.db
        .select({
          ...getTableColumns(schema.sentence),
          entity: {
            arabicText: schema.arabicEntity.arabicText,
            audioUrl: schema.arabicEntity.audioUrl,
            normalizedText: schema.arabicEntity.normalizedText,
          },
        })
        .from(schema.sentence)
        .innerJoin(
          schema.arabicEntity,
          eq(schema.sentence.entityId, schema.arabicEntity.id),
        )
        .where(condition)
        .orderBy(desc(schema.sentence.createdAt), desc(schema.sentence.id))
        .offset((page - 1) * limit)
        .limit(limit),
    ]);
    const total = Number(countRows[0]?.count ?? 0);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async getById(id: string) {
    const rows = await this.db.db
      .select()
      .from(schema.sentence)
      .where(eq(schema.sentence.id, id))
      .limit(1);
    const sentence = rows[0] ?? null;
    if (!sentence) throw new NotFoundException('Sentence not found');
    return sentence;
  }

  async create(dto: CreateSentenceDto, createdById: string) {
    let entity = await this.arabicEntityService.findByNormalizedText(dto.text);

    if (!entity) {
      entity = await this.arabicEntityService.create({ arabicText: dto.text, audioUrl: dto.audioUrl, createdById });
    } else {
      const rows = await this.db.db
        .select()
        .from(schema.sentence)
        .where(eq(schema.sentence.entityId, entity.id))
        .limit(1);
      const existingSentence = rows[0] ?? null;
      if (existingSentence) throw new ConflictException('A sentence already exists for this Arabic text');
    }

    const insertData: typeof schema.sentence.$inferInsert = {
      id: randomUUID(),
      sentenceKey: `sentence_${randomUUID()}`,
      entityId: entity.id,
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
    };
    const rows = await this.db.db
      .insert(schema.sentence)
      .values(insertData)
      .returning();
    const sentence = rows[0] ?? null;
    if (!sentence) throw new Error('Failed to create sentence');

    if (dto.words?.length) {
      return this.replaceWords(sentence.id, dto.words);
    }
    return sentence;
  }

  async update(id: string, dto: UpdateSentenceDto) {
    await this.getById(id);
    const { words, ...rest } = dto;
    const rows = await this.db.db
      .update(schema.sentence)
      .set(rest)
      .where(eq(schema.sentence.id, id))
      .returning();
    const sentence = rows[0] ?? null;
    if (words) return this.replaceWords(id, words);
    return sentence;
  }

  async remove(id: string) {
    const sentence = await this.getById(id);
    await this.db.db
      .delete(schema.sentence)
      .where(eq(schema.sentence.id, sentence.id));
  }

  async generateWithAi(rawText: string, createdById: string) {
    const text = ARABIC_REGEX.test(rawText) ? rawText : await this.aiService.translateToArabic(rawText);

    let entity = await this.arabicEntityService.findByNormalizedText(text);

    if (entity) {
      const rows = await this.db.db
      .select()
      .from(schema.sentence)
      .where(eq(schema.sentence.entityId, entity.id))
      .limit(1);
      const existingSentence = rows[0] ?? null;
      if (existingSentence) return existingSentence;
    } else {
      entity = await this.arabicEntityService.create({ arabicText: text, createdById });
    }

    const placeholder = '';
    const rows = await this.db.db
      .insert(schema.sentence)
      .values({
      id: randomUUID(),
      entityId: entity.id,
      sentenceKey: `sentence_${randomUUID()}`,
      meaningEn: placeholder,
      meaningBn: placeholder,
      whenToUseEn: placeholder,
      whenToUseBn: placeholder,
      pronunciationEn: placeholder,
      pronunciationBn: placeholder,
      feminineEn: placeholder,
      feminineBn: placeholder,
      category: DEFAULT_CATEGORY,
      difficulty: DifficultyLevel.BEGINNER,
      status: ContentStatus.DRAFT,
      createdById,
      })
      .returning();
    const sentence = rows[0] ?? null;
    if (!sentence) throw new Error('Failed to create sentence');

    await this.sentenceQueue.add('process-sentence', {
      sentenceId: sentence.id,
      arabicText: text,
      createdById,
    });
    return sentence;
  }

  async resyncWords(id: string) {
    const sentence = await this.getById(id);
    const entity = await this.arabicEntityService.findById(sentence.entityId);
    if (!entity) throw new NotFoundException('Sentence entity not found');

    await this.sentenceQueue.add('resync-sentence-words', {
      sentenceId: sentence.id,
      arabicText: entity.arabicText,
    });
    return { sentenceId: sentence.id };
  }

  private async replaceWords(
    sentenceId: string,
    words: { wordId: string; position: number }[],
  ) {
    return this.db.$transaction(async (tx) => {
      await tx
        .delete(schema.sentenceWord)
        .where(eq(schema.sentenceWord.sentenceId, sentenceId));

      if (words.length) {
        await tx.insert(schema.sentenceWord).values(
          words.map((word) => ({
            id: randomUUID(),
            sentenceId,
            ...word,
          })),
        );
      }

      const rows = await tx
        .select()
        .from(schema.sentence)
        .where(eq(schema.sentence.id, sentenceId))
        .limit(1);

      return rows[0] ?? null;
    });
  }
}
