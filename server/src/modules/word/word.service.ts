import { Prisma } from "@/generated/prisma/client.js";
import { CACHE_TTL } from "@/shared/constants.js";
import { ApiError } from "@/lib/api-error.js";
import {
  cacheGet,
  cacheKey,
  cacheNamespaces,
  cacheSet,
  invalidateCacheNamespace,
} from "@/integrations/cache.js";
import { ListWordsQuery, WordInput } from "./word.validation.js";
import { WordRepository, presentWord } from "./word.repository.js";

// Re-export for controllers and other modules
export { WORD_INCLUDE } from "./word.repository.js";

type WordListResult = {
  items: ReturnType<typeof presentWord>[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export async function list(query: ListWordsQuery) {
  const key = cacheKey(cacheNamespaces.words, query);
  const cached = await cacheGet<WordListResult>(key);
  if (cached) return cached;

  const { page, limit, status, categoryId, search } = query;

  const where: Prisma.WordWhereInput = {
    ...(status ? { status } : {}),
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
    WordRepository.findMany(where, (page - 1) * limit, limit),
    WordRepository.count(where),
  ]);

  const result: WordListResult = {
    items: items.map(presentWord),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
  await cacheSet(key, result, CACHE_TTL.WORDS);
  return result;
}

export async function getById(id: string) {
  const word = await WordRepository.findById(id);
  if (!word) throw ApiError.notFound("Word not found");
  return presentWord(word);
}

export async function create(input: WordInput) {
  const { text } = input;

  const existingText = await WordRepository.findArabicTextByText(text);
  if (existingText) throw ApiError.conflict("This Arabic text already exists");

  const word = await WordRepository.create(input);

  const result = presentWord(word as any);
  await invalidateCacheNamespace(cacheNamespaces.words);
  return result;
}

export async function update(id: string, input: Partial<WordInput>) {
  await getById(id); // ensures 404 before attempting the update

  const word = await WordRepository.update(id, input);

  const result = presentWord(word);
  await invalidateCacheNamespace(cacheNamespaces.words);
  return result;
}

export async function remove(id: string): Promise<void> {
  const word = await WordRepository.findById(id);
  if (!word) throw ApiError.notFound("Word not found");

  // Deleting the ArabicText cascades to Word and its category links.
  await WordRepository.delete(id);
  await invalidateCacheNamespace(cacheNamespaces.words);
}
