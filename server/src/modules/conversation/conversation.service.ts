import {
  cacheGet,
  cacheKey,
  cacheNamespaces,
  cacheSet,
  invalidateCacheNamespace,
} from "@/integrations/cache.js";
import { ApiError } from "@/lib/api-error.js";
import { TopicConversationRepository } from "@/modules/topicConversation/topic_conversation.repository.js";
import { CACHE_TTL } from "@/shared/constants.js";
import { ConversationRepository } from "./conversation.repository.js";
import {
  CreateConversationInput,
  ListConversationsQuery,
  UpdateConversationInput,
} from "./conversation.validation.js";

type ConversationListResult = {
  items: Awaited<ReturnType<typeof ConversationRepository.findMany>>;
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export async function list(query: ListConversationsQuery) {
  const key = cacheKey(cacheNamespaces.conversations, query);
  const cached = await cacheGet<ConversationListResult>(key);
  if (cached) return cached;

  const { page, limit, topicConversationId } = query;

  const where = topicConversationId ? { topicConversationId } : {};

  const [items, total] = await Promise.all([
    ConversationRepository.findMany(where, (page - 1) * limit, limit),
    ConversationRepository.count(where),
  ]);

  const result: ConversationListResult = {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
  await cacheSet(key, result, CACHE_TTL.CONVERSATIONS);
  return result;
}

export async function getById(id: string) {
  const conversation = await ConversationRepository.findById(id);
  if (!conversation) throw ApiError.notFound("Conversation not found");
  return conversation;
}

export async function create(input: CreateConversationInput) {
  const topicConversation = await TopicConversationRepository.findById(
    input.topicConversationId,
  );
  if (!topicConversation)
    throw ApiError.badRequest("Topic conversation does not exist");

  const conversation = await ConversationRepository.create(input);
  await invalidateCacheNamespace(cacheNamespaces.conversations);
  return conversation;
}

export async function update(id: string, input: UpdateConversationInput) {
  await getById(id); // 404s early if it doesn't exist

  if (input.topicConversationId) {
    const topicConversation = await TopicConversationRepository.findById(
      input.topicConversationId,
    );
    if (!topicConversation)
      throw ApiError.badRequest("Topic conversation does not exist");
  }

  const conversation = await ConversationRepository.update(id, input);
  await invalidateCacheNamespace(cacheNamespaces.conversations);
  return conversation;
}

export async function remove(id: string): Promise<void> {
  await getById(id);

  // Cascades to ConversationLine.
  await ConversationRepository.delete(id);
  await invalidateCacheNamespace(cacheNamespaces.conversations);
}
