import { Prisma } from "@/generated/prisma/client.js";
import {
  cacheGet,
  cacheKey,
  cacheNamespaces,
  cacheSet,
  invalidateCacheNamespace,
} from "@/integrations/cache.js";
import { ApiError } from "@/lib/api-error.js";
import { CACHE_TTL } from "@/shared/constants.js";
import { SentenceRepository, presentSentence } from "./sentence.repository.js";
import { ListSentencesQuery, SentenceInput } from "./sentence.validation.js";

// Re-export for controllers and other modules
export { SENTENCE_INCLUDE } from "./sentence.repository.js";

type SentenceListResult = {
  items: ReturnType<typeof presentSentence>[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export async function list(query: ListSentencesQuery) {
  const key = cacheKey(cacheNamespaces.sentences, query);
  const cached = await cacheGet<SentenceListResult>(key);
  if (cached) return cached;

  const { page, limit, categoryId, search } = query;

  const where: Prisma.SentenceWhereInput = {
    ...(categoryId ? { categories: { some: { categoryId } } } : {}),
    ...(search
      ? {
        OR: [
          { arabic: { text: { contains: search, mode: "insensitive" } } },
          { meaningEn: { contains: search, mode: "insensitive" } },
          { meaningBn: { contains: search, mode: "insensitive" } },
        ],
      }
      : {}),
  };

  const [items, total] = await Promise.all([
    SentenceRepository.findMany(where, (page - 1) * limit, limit),
    SentenceRepository.count(where),
  ]);

  const result: SentenceListResult = {
    items: items.map(presentSentence),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
  await cacheSet(key, result, CACHE_TTL.SENTENCES);
  return result;
}

export async function getById(id: string) {
  const sentence = await SentenceRepository.findById(id);
  if (!sentence) throw ApiError.notFound("Sentence not found");
  return presentSentence(sentence);
}

export async function create(input: SentenceInput) {
  const existingText = await SentenceRepository.findArabicTextByText(input.text);
  if (existingText) throw ApiError.conflict("This Arabic text already exists");

  const sentence = await SentenceRepository.create(input);

  const result = presentSentence(sentence);
  await invalidateCacheNamespace(cacheNamespaces.sentences);
  return result;
}

export async function update(id: string, input: Partial<SentenceInput>) {
  await getById(id); // 404s early if it doesn't exist

  const sentence = await SentenceRepository.update(id, input);

  const result = presentSentence(sentence);
  await invalidateCacheNamespace(cacheNamespaces.sentences);
  return result;
}

export async function remove(id: string): Promise<void> {
  const sentence = await SentenceRepository.findById(id);
  if (!sentence) throw ApiError.notFound("Sentence not found");

  // Deleting the ArabicText cascades to Sentence + its category/word links.
  await SentenceRepository.deleteArabicText(sentence.arabicId);
  await invalidateCacheNamespace(cacheNamespaces.sentences);
}