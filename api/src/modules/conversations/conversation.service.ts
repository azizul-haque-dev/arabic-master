import { v7 as randomUUIDv7 } from 'uuid';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../common/errors/app-error.js';
import { paginated } from '../../common/http/response.js';
import type { UpdateStatusInput } from '../../common/schemas.js';
import {
  assertEditable,
  resolveStatusChange,
} from '../../common/utils/content-workflow.util.js';
import { withTransaction, type Tx } from '../../database/db.js';
import { ContentStatus } from '../../database/drizzle/enums.js';
import type { RequestUser } from '../auth/auth.types.js';
import type { ConversationRepository } from './conversation.repository.js';
import type {
  CreateConversationInput,
  ListConversationQuery,
  ReplaceTurnsInput,
  TurnInput,
  UpdateConversationInput,
} from './conversation.schemas.js';

export function createConversationService(repo: ConversationRepository) {
  // order আসে array index থেকে (১-ভিত্তিক), client-এর পাঠানো মান থেকে নয়
  const toTurnRows = (conversationId: string, turns: TurnInput[]) =>
    turns.map((t, i) => ({
      id: randomUUIDv7(),
      conversationId,
      order: i + 1,
      speaker: t.speaker,
      sentenceId: t.sentenceId,
    }));

  async function assertSentencesExist(tx: Tx, turns: TurnInput[]) {
    const ids = [...new Set(turns.map((t) => t.sentenceId))];
    if (!ids.length) return;
    const found = await repo.existingSentenceIds(ids, tx);
    const missing = ids.filter((id) => !found.has(id));
    if (missing.length)
      throw new BadRequestError(`Sentence(s) not found: ${missing.join(', ')}`);
  }

  async function getById(id: string) {
    const conversation = await repo.findById(id);
    if (!conversation) throw new NotFoundError('Conversation not found');
    return { ...conversation, turns: await repo.turnsDetailed(id) };
  }

  return {
    async list(q: ListConversationQuery) {
      const { items, total } = await repo.list(q);
      const counts = await repo.turnCounts(items.map((i) => i.id));
      return paginated(
        items.map((i) => ({ ...i, turnCount: counts.get(i.id) ?? 0 })),
        q.page,
        q.limit,
        total,
      );
    },

    getById,

    async create(dto: CreateConversationInput, actor: RequestUser) {
      const { turns = [], ...meta } = dto;
      const id = await withTransaction(async (tx) => {
        await assertSentencesExist(tx, turns);
        const created = await repo.insert(
          {
            id: randomUUIDv7(),
            conversationKey: `conversation_${randomUUIDv7()}`,
            ...meta,
            status: ContentStatus.DRAFT,
            createdById: actor.userId,
          },
          tx,
        );
        if (turns.length)
          await repo.insertTurns(toTurnRows(created.id, turns), tx);
        return created.id;
      });
      return getById(id);
    },

    async update(id: string, dto: UpdateConversationInput, actor: RequestUser) {
      const conversation = await repo.findById(id);
      if (!conversation) throw new NotFoundError('Conversation not found');
      assertEditable(conversation.status, actor.role);
      return repo.update(id, dto);
    },

    async replaceTurns(id: string, dto: ReplaceTurnsInput, actor: RequestUser) {
      await withTransaction(async (tx) => {
        const conversation = await repo.lockById(id, tx);
        if (!conversation) throw new NotFoundError('Conversation not found');
        assertEditable(conversation.status, actor.role);

        await assertSentencesExist(tx, dto.turns);
        await repo.deleteTurns(id, tx);
        if (dto.turns.length)
          await repo.insertTurns(toTurnRows(id, dto.turns), tx);
        await repo.update(id, {}, tx); // শুধু updatedAt
      });
      return getById(id);
    },

    changeStatus(id: string, dto: UpdateStatusInput, actor: RequestUser) {
      return withTransaction(async (tx) => {
        const conversation = await repo.lockById(id, tx);
        if (!conversation) throw new NotFoundError('Conversation not found');

        const next = resolveStatusChange({
          from: conversation.status,
          to: dto.status,
          role: actor.role,
          rejectionReason: dto.rejectionReason,
        });

        if (
          dto.status === ContentStatus.IN_REVIEW &&
          !(await repo.hasTurns(id, tx))
        ) {
          throw new ConflictError(
            'Add at least one turn before submitting for review',
          );
        }
        if (dto.status === ContentStatus.PUBLISHED) {
          const keys = await repo.unpublishedSentenceKeys(id, tx);
          if (keys.length)
            throw new ConflictError(
              `Publish these sentences first: ${keys.join(', ')}`,
            );
        }
        return repo.update(id, next, tx);
      });
    },

    async remove(id: string) {
      if (!(await repo.findById(id)))
        throw new NotFoundError('Conversation not found');
      await withTransaction(async (tx) => {
        if (await repo.usedByLesson(id, tx)) {
          throw new ConflictError(
            'This conversation is used in a lesson. Remove it from the lesson first, or archive it instead.',
          );
        }
        await repo.deleteTurns(id, tx); // DB-তে cascade নেই, তাই হাতে
        await repo.delete(id, tx);
      });
      return { deleted: true };
    },
  };
}
export type ConversationService = ReturnType<typeof createConversationService>;
