import {
  cacheGet,
  cacheKey,
  cacheNamespaces,
  cacheSet,
  invalidateCacheNamespace,
} from "@/integrations/cache.js";
import { ApiError } from "@/lib/api-error.js";
import { CACHE_TTL } from "@/shared/constants.js";
import { TopicRepository } from "../topic/topic.repository.js";
import {
  presentTopicConversation,
  TopicConversationRepository,
} from "./topic_conversation.repository.js";
import {
  CreateTopicConversationInput,
  ListTopicConversationsQuery,
} from "./topic_conversation.validation.js";

type TopicConversationListResult = {
  items: ReturnType<typeof presentTopicConversation>[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export async function list(query: ListTopicConversationsQuery) {
  // create redis key
  const key = cacheKey(cacheNamespaces.topicConversations, query);

  // check in cache
  const cached = await cacheGet<TopicConversationListResult>(key);

  if (cached) return cached;

  // destructure query
  const { page, limit, search, topicId } = query;

  const where = {
    ...(topicId ? { topicId } : {}),
    ...(search
      ? {
          OR: [
            { titleEn: { contains: search, mode: "insensitive" } as const },
            { titleBn: { contains: search, mode: "insensitive" } as const },
          ],
        }
      : {}),
  };
  const skip = (page - 1) * limit;
  // fetch data form db paralally
  const [items, total] = await Promise.all([
    TopicConversationRepository.findMany(where, skip, limit),
    TopicConversationRepository.count(where),
  ]);
  const result: TopicConversationListResult = {
    items: items.map(presentTopicConversation),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
  // set result in cache
  await cacheSet(key, result, CACHE_TTL.TOPIC_CONVERSATIONS);
  return result;
}

export async function getById(id: string) {
  const topicConversation = await TopicConversationRepository.findById(id);
  if (!topicConversation) throw ApiError.badRequest("Topic dose not exist");
}

export async function create(data: CreateTopicConversationInput) {
  const topic = await TopicRepository.findById(data.topicId);
  if (!topic) throw ApiError.badRequest("Topic dose not exist");
  const topicConversation = await TopicConversationRepository.create(data);
  await invalidateCacheNamespace(cacheNamespaces.topicConversations);
  return presentTopicConversation(topicConversation);
}

export async function update(id: string, data: CreateTopicConversationInput) {
  if (data.topicId) {
    const topic = await TopicRepository.findById(data.topicId);
    if (!topic) throw ApiError.badRequest("Topic dose not exist");
  }
  const topicConversation = await TopicConversationRepository.update(id, data);
  await invalidateCacheNamespace(cacheNamespaces.topicConversations);
  return presentTopicConversation(topicConversation);
}

export async function remove(id: string) {
  await TopicConversationRepository.delete(id);
  await invalidateCacheNamespace(cacheNamespaces.topicConversations);
}
