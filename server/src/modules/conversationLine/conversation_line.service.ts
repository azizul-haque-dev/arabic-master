import {
  cacheGet,
  cacheKey,
  cacheNamespaces,
  cacheSet,
  invalidateCacheNamespace,
} from "@/integrations/cache.js";
import { ApiError } from "@/lib/api-error.js";
import { CACHE_TTL } from "@/shared/constants.js";
import { ConversationRepository } from "../conversation/conversation.repository.js";
import { SentenceRepository } from "../sentence/sentence.repository.js";
import { processNewSentence } from "../sentence/sentence.ai.service.js";

import { ConversationLineRepository } from "./conversation_line.repository.js";
import {
  CreateConversationLineInput,
  ListConversationLinesQuery,
  UpdateConversationLineInput,
} from "./conversation_line.validation.js";

type ConversationLineListResult = {
  items: Awaited<ReturnType<typeof ConversationLineRepository.findMany>>;
  meta: { page: number; limit: number; total: number; totalPages: number };
};


async function resolveSentenceId(input: {
  sentenceId?: string;
  text?: string;
}): Promise<string> {
  if (input.sentenceId) {
    const sentence = await SentenceRepository.findById(input.sentenceId);
    if (!sentence) throw ApiError.badRequest("Sentence does not exist");
    return sentence.id;
  }

  const text = input.text as string;
  const existing = await SentenceRepository.findByArabicText(text);
  if (existing) return existing.id;

  const { sentenceId } = await processNewSentence(text);
  return sentenceId;
}

async function assertPositionAvailable(
  conversationId: string,
  position: number,
  excludeId?: string,
) {
  const clash = await ConversationLineRepository.findByConversationAndPosition(
    conversationId,
    position,
    excludeId,
  );
  if (clash) {
    throw ApiError.conflict(
      `Position ${position} is already taken in this conversation`,
    );
  }
}

async function invalidateRelatedCaches() {
  await Promise.all([
    invalidateCacheNamespace(cacheNamespaces.conversationLines),
    invalidateCacheNamespace(cacheNamespaces.conversations),
  ]);
}

export async function list(query: ListConversationLinesQuery) {
  const key = cacheKey(cacheNamespaces.conversationLines, query);
  const cached = await cacheGet<ConversationLineListResult>(key);
  if (cached) return cached;

  const { page, limit, conversationId } = query;
  const where = conversationId ? { conversationId } : {};

  const [items, total] = await Promise.all([
    ConversationLineRepository.findMany(where, (page - 1) * limit, limit),
    ConversationLineRepository.count(where),
  ]);

  const result: ConversationLineListResult = {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
  await cacheSet(key, result, CACHE_TTL.CONVERSATION_LINES);
  return result;
}

export async function getById(id: string) {
  const line = await ConversationLineRepository.findById(id);
  if (!line) throw ApiError.notFound("Conversation line not found");
  return line;
}

export async function create(input: CreateConversationLineInput) {
  const conversation = await ConversationRepository.findById(
    input.conversationId,
  );
  if (!conversation) throw ApiError.badRequest("Conversation does not exist");

  await assertPositionAvailable(input.conversationId, input.position);

  const sentenceId = await resolveSentenceId(input);

  const line = await ConversationLineRepository.create({
    conversationId: input.conversationId,
    sentenceId,
    speaker: input.speaker,
    position: input.position,
    meaningEn: input.meaningEn,
    meaningBn: input.meaningBn,
  });

  await invalidateRelatedCaches();
  return line;
}


export async function update(id: string, input: UpdateConversationLineInput) {
  const current = await ConversationLineRepository.exists(id);
  if (!current) throw ApiError.notFound("Conversation line not found");

  if (input.position !== undefined && input.position !== current.position) {
    await assertPositionAvailable(
      current.conversationId,
      input.position,
      id,
    );
  }

  const sentenceId =
    input.sentenceId || input.text ? await resolveSentenceId(input) : undefined;

  const { text: _text, sentenceId: _rawSentenceId, ...rest } = input;

  const line = await ConversationLineRepository.update(id, {
    ...rest,
    ...(sentenceId ? { sentenceId } : {}),
  });

  await invalidateRelatedCaches();
  return line;
}


export async function remove(id: string): Promise<void> {
  const current = await ConversationLineRepository.exists(id);
  if (!current) throw ApiError.notFound("Conversation line not found");

  // Only removes the line, not the underlying Sentence - it may be
  // referenced by other conversation lines.
  await ConversationLineRepository.delete(id);
  await invalidateRelatedCaches();
}