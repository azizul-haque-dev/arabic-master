import { prisma } from "@/config/database.js";
import {
  cacheGet,
  cacheKey,
  cacheNamespaces,
  cacheSet,
  invalidateCacheNamespace,
} from "@/integrations/cache.js";
import { ApiError } from "@/lib/api-error.js";
import { CACHE_TTL } from "@/shared/constants.js";
import { presentTopic, TopicRepository } from "./topic.repository.js";
import {
  CreateTopicInput,
  ListTopicQuery,
  UpdateTopicInput,
} from "./topic.validation.js";

type TopicListResult = {
  items: ReturnType<typeof presentTopic>[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export async function list(query: ListTopicQuery) {
  const key = cacheKey(cacheNamespaces.topics, query);
  const cached = await cacheGet<TopicListResult>(key);
  if (cached) return cached;
  const { page, limit, search } = query;
  const where = search
    ? {
        OR: [
          { titleEn: { contains: search, mode: "insensitive" as const } },
          { titleBn: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    TopicRepository.findMany(where, skip, limit),
    prisma.topic.count({ where }),
  ]);
  const result: TopicListResult = {
    items: items.map(presentTopic),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
  await cacheSet(key, result, CACHE_TTL.TOPICS);
  return result;
}

export async function getById(id: string) {
  const topic = await TopicRepository.findById(id);
  if (!topic) throw ApiError.notFound("Topic not found");
  return presentTopic(topic);
}

export async function create(data: CreateTopicInput) {
  const existingTopic = await TopicRepository.findByTitleEn(data.titleEn);

  if (!existingTopic)
    throw ApiError.conflict("A topic with this title already exists");
  const topic = await TopicRepository.create(data);
  await invalidateCacheNamespace(cacheNamespaces.topics);

  return presentTopic(topic);
}

export async function update(data: UpdateTopicInput, id: string) {
  const topic = await TopicRepository.update(id, data);

  await invalidateCacheNamespace(cacheNamespaces.topics);

  return presentTopic(topic);
}

export async function remove(id: string) {
  await TopicRepository.delete(id);
  await invalidateCacheNamespace(cacheNamespaces.topics);
}
