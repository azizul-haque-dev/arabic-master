import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  ne,
  or,
  type SQL,
} from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import {
  DatabaseService,
  type DatabaseTransaction,
} from '../../database/drizzle/db.service.js';
import { ContentStatus, Role } from '../../database/drizzle/enums.js';
import * as schema from '../../database/drizzle/schema.js';
import type { RequestUser } from '../auth/types/jwt-payload.type.js';
import {
  CONTENT_MANAGER_ALLOWED_TARGETS,
  CONTENT_MANAGER_EDITABLE_STATUSES,
  STATUS_TRANSITIONS,
} from './conversations.constants.js';
import { CreateConversationDto, TurnInputDto } from './dto/create-conversation.dto.js';
import { ListConversationQueryDto } from './dto/list-conversation-query.dto.js';
import { ReplaceTurnsDto } from './dto/replace-turns.dto.js';
import { UpdateConversationDto } from './dto/update-conversation.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';

type ConversationRow = typeof schema.conversation.$inferSelect;

// Escape wildcard characters (%, _, \) to prevent unintended matching in SQL ILIKE queries.
// E.g., searching for "100%" without escaping would otherwise match every record.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

@Injectable()
export class ConversationsService {
  constructor(private readonly db: DatabaseService) {}

  // ------------- Query / Read Operations -------------

  async list(query: ListConversationQueryDto) {
    const { page, limit, status, category, search } = query;

    const conditions: SQL[] = [];
    if (status) conditions.push(eq(schema.conversation.status, status));
    if (category) conditions.push(eq(schema.conversation.category, category));
    if (search?.trim()) {
      const pattern = `%${escapeLike(search.trim())}%`;
      conditions.push(
        or(
          ilike(schema.conversation.title, pattern),
          ilike(schema.conversation.topic, pattern),
          ilike(schema.conversation.conversationKey, pattern),
        )!,
      );
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const [totalRows, items] = await Promise.all([
      this.db.db
        .select({ total: count() })
        .from(schema.conversation)
        .where(where),
      this.db.db
        .select()
        .from(schema.conversation)
        .where(where)
        // Use ID as secondary sort order for deterministic pagination when createdAt timestamps are identical
        .orderBy(desc(schema.conversation.createdAt), desc(schema.conversation.id))
        .limit(limit)
        .offset((page - 1) * limit),
    ]);

    const total = Number(totalRows[0]?.total ?? 0);

    // Aggregate turn counts for current page items in a single query to eliminate N+1 overhead
    const ids = items.map((item) => item.id);
    const turnCountRows = ids.length
      ? await this.db.db
          .select({
            conversationId: schema.conversationTurn.conversationId,
            turnCount: count(),
          })
          .from(schema.conversationTurn)
          .where(inArray(schema.conversationTurn.conversationId, ids))
          .groupBy(schema.conversationTurn.conversationId)
      : [];
    const turnCounts = new Map(
      turnCountRows.map((row) => [row.conversationId, Number(row.turnCount)]),
    );

    return {
      items: items.map((item) => ({
        ...item,
        turnCount: turnCounts.get(item.id) ?? 0,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getById(id: string) {
    const conversation = await this.findOrThrow(id);

    // Use leftJoin to preserve turns even if a sentence is deleted, returning sentence as null
    // (since foreign key constraints are not enforced at the database level)
    const turns = await this.db.db
      .select({
        id: schema.conversationTurn.id,
        order: schema.conversationTurn.order,
        speaker: schema.conversationTurn.speaker,
        sentenceId: schema.conversationTurn.sentenceId,
        sentence: {
          id: schema.sentence.id,
          sentenceKey: schema.sentence.sentenceKey,
          meaningEn: schema.sentence.meaningEn,
          meaningBn: schema.sentence.meaningBn,
          status: schema.sentence.status,
        },
        arabicText: schema.arabicEntity.arabicText,
        audioUrl: schema.arabicEntity.audioUrl,
      })
      .from(schema.conversationTurn)
      .leftJoin(
        schema.sentence,
        eq(schema.sentence.id, schema.conversationTurn.sentenceId),
      )
      .leftJoin(
        schema.arabicEntity,
        eq(schema.arabicEntity.id, schema.sentence.entityId),
      )
      .where(eq(schema.conversationTurn.conversationId, id))
      .orderBy(asc(schema.conversationTurn.order));

    return { ...conversation, turns };
  }

  // ------------- Mutation / Write Operations -------------

  async create(dto: CreateConversationDto, actor: RequestUser) {
    const { turns = [], ...meta } = dto;

    const createdId = await this.db.$transaction(async (tx) => {
      await this.assertSentencesExist(tx, turns);

      const [created] = await tx
        .insert(schema.conversation)
        .values({
          id: randomUUID(),
          conversationKey: `conversation_${randomUUID()}`,
          ...meta,
          status: ContentStatus.DRAFT,
          createdById: actor.userId,
        })
        .returning();

      if (turns.length) {
        await tx
          .insert(schema.conversationTurn)
          .values(this.toTurnRows(created.id, turns));
      }

      return created.id;
    });

    return this.getById(createdId);
  }

  async update(id: string, dto: UpdateConversationDto, actor: RequestUser) {
    const conversation = await this.findOrThrow(id);
    this.assertEditable(conversation, actor);

    // Explicitly update updatedAt since the table schema lacks an automatic $onUpdate trigger
    const [updated] = await this.db.db
      .update(schema.conversation)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(schema.conversation.id, id))
      .returning();

    return updated;
  }

  async replaceTurns(id: string, dto: ReplaceTurnsDto, actor: RequestUser) {
    await this.db.$transaction(async (tx) => {
      // Acquire exclusive row lock to serialize concurrent requests and avoid conflicts on (conversationId, order)
      const locked = await tx
        .select()
        .from(schema.conversation)
        .where(eq(schema.conversation.id, id))
        .limit(1)
        .for('update');

      const conversation = locked[0];
      if (!conversation) throw new NotFoundException('Conversation not found');
      this.assertEditable(conversation, actor);

      await this.assertSentencesExist(tx, dto.turns);

      // Atomically delete existing turns and re-insert new ones within the transaction to prevent unique index violation
      await tx
        .delete(schema.conversationTurn)
        .where(eq(schema.conversationTurn.conversationId, id));

      if (dto.turns.length) {
        await tx
          .insert(schema.conversationTurn)
          .values(this.toTurnRows(id, dto.turns));
      }

      await tx
        .update(schema.conversation)
        .set({ updatedAt: new Date() })
        .where(eq(schema.conversation.id, id));
    });

    return this.getById(id);
  }

  async changeStatus(id: string, dto: UpdateStatusDto, actor: RequestUser) {
    return this.db.$transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(schema.conversation)
        .where(eq(schema.conversation.id, id))
        .limit(1)
        .for('update');

      const conversation = rows[0];
      if (!conversation) throw new NotFoundException('Conversation not found');

      const from = conversation.status;
      const to = dto.status;

      if (!STATUS_TRANSITIONS[from].includes(to)) {
        throw new ConflictException(`Cannot change status from ${from} to ${to}`);
      }

      if (
        actor.role === Role.CONTENT_MANAGER &&
        !CONTENT_MANAGER_ALLOWED_TARGETS.includes(to)
      ) {
        throw new ForbiddenException(
          'Content Manager can only move content to DRAFT or IN_REVIEW',
        );
      }

      const reason = dto.rejectionReason?.trim();
      if (to === ContentStatus.REJECTED && !reason) {
        throw new BadRequestException('rejectionReason is required when rejecting');
      }

      if (to === ContentStatus.IN_REVIEW) {
        await this.assertHasTurns(tx, id);
      }
      if (to === ContentStatus.PUBLISHED) {
        await this.assertAllSentencesPublished(tx, id);
      }

      const [updated] = await tx
        .update(schema.conversation)
        .set({
          status: to,
          rejectionReason: to === ContentStatus.REJECTED ? reason : null,
          updatedAt: new Date(),
        })
        .where(eq(schema.conversation.id, id))
        .returning();

      return updated;
    });
  }

  async remove(id: string) {
    await this.findOrThrow(id);

    await this.db.$transaction(async (tx) => {
      // Guard against deleting conversations actively used in curriculum lessons
      const usedBy = await tx
        .select({ lessonId: schema.lessonContentItem.lessonId })
        .from(schema.lessonContentItem)
        .where(eq(schema.lessonContentItem.conversationId, id))
        .limit(1);

      if (usedBy.length) {
        throw new ConflictException(
          'This conversation is used in a lesson. Remove it from the lesson first, or archive it instead.',
        );
      }

      // Manually delete child conversation turns as cascade delete is not enforced at the schema level
      await tx
        .delete(schema.conversationTurn)
        .where(eq(schema.conversationTurn.conversationId, id));
      await tx.delete(schema.conversation).where(eq(schema.conversation.id, id));
    });

    return { deleted: true };
  }

  // ------------- Helper Validations & Mapping -------------

  private async findOrThrow(id: string): Promise<ConversationRow> {
    const rows = await this.db.db
      .select()
      .from(schema.conversation)
      .where(eq(schema.conversation.id, id))
      .limit(1);

    const conversation = rows[0];
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  private assertEditable(conversation: ConversationRow, actor: RequestUser) {
    if (
      actor.role === Role.CONTENT_MANAGER &&
      !CONTENT_MANAGER_EDITABLE_STATUSES.includes(conversation.status)
    ) {
      throw new ForbiddenException(
        'Content Manager can only edit conversations in DRAFT or REJECTED status',
      );
    }
  }

  private toTurnRows(conversationId: string, turns: TurnInputDto[]) {
    return turns.map((turn, index) => ({
      id: randomUUID(),
      conversationId,
      order: index + 1, // Derive 1-based sequence order from array indices rather than client payload
      speaker: turn.speaker,
      sentenceId: turn.sentenceId,
    }));
  }

  private async assertSentencesExist(
    tx: DatabaseTransaction,
    turns: TurnInputDto[],
  ) {
    const uniqueIds = [...new Set(turns.map((turn) => turn.sentenceId))];
    if (!uniqueIds.length) return;

    const found = await tx
      .select({ id: schema.sentence.id })
      .from(schema.sentence)
      .where(inArray(schema.sentence.id, uniqueIds));

    const foundIds = new Set(found.map((row) => row.id));
    const missing = uniqueIds.filter((id) => !foundIds.has(id));
    if (missing.length) {
      throw new BadRequestException(`Sentence(s) not found: ${missing.join(', ')}`);
    }
  }

  private async assertHasTurns(tx: DatabaseTransaction, conversationId: string) {
    const rows = await tx
      .select({ id: schema.conversationTurn.id })
      .from(schema.conversationTurn)
      .where(eq(schema.conversationTurn.conversationId, conversationId))
      .limit(1);

    if (!rows.length) {
      throw new ConflictException(
        'Add at least one turn before submitting for review',
      );
    }
  }

  // Verify that all sentences referenced by the conversation are published before publishing the conversation itself
  private async assertAllSentencesPublished(
    tx: DatabaseTransaction,
    conversationId: string,
  ) {
    const notPublished = await tx
      .select({ sentenceKey: schema.sentence.sentenceKey })
      .from(schema.conversationTurn)
      .innerJoin(
        schema.sentence,
        eq(schema.sentence.id, schema.conversationTurn.sentenceId),
      )
      .where(
        and(
          eq(schema.conversationTurn.conversationId, conversationId),
          ne(schema.sentence.status, ContentStatus.PUBLISHED),
        ),
      );

    if (notPublished.length) {
      const keys = [...new Set(notPublished.map((row) => row.sentenceKey))];
      throw new ConflictException(
        `Publish these sentences first: ${keys.join(', ')}`,
      );
    }
  }
}
