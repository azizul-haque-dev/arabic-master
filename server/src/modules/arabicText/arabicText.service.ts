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
import { ArabicTextRepository } from "./arabicText.repository.js";
import { enqueueArabicTextProcessing } from "./arabicText.queue.js";
import {
  CreateArabicTextInput,
  GenerateArabicTextInput,
  GenerateArabicTextResponse,
  ListArabicTextsQuery,
  UpdateArabicTextInput,
} from "./arabicText.types.js";

type ArabicTextListResult = {
  items: Awaited<ReturnType<typeof ArabicTextRepository.findMany>>;
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export async function list(query: ListArabicTextsQuery) {
  const key = cacheKey(cacheNamespaces.arabicTexts, query);
  const cached = await cacheGet<ArabicTextListResult>(key);
  if (cached) return cached;

  const { page, limit, status, aiStatus, search } = query;

  const where: Prisma.ArabicTextWhereInput = {
    ...(status ? { status } : {}),
    ...(aiStatus ? { aiStatus } : {}),
    ...(search ? { text: { contains: search, mode: "insensitive" } } : {}),
  };

  const [items, total] = await Promise.all([
    ArabicTextRepository.findMany(where, (page - 1) * limit, limit),
    ArabicTextRepository.count(where),
  ]);

  const result: ArabicTextListResult = {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
  await cacheSet(key, result, CACHE_TTL.ARABIC_TEXTS);
  return result;
}

export async function getById(id: string) {
  const arabicText = await ArabicTextRepository.findById(id);
  if (!arabicText) throw ApiError.notFound("Arabic text not found");
  return arabicText;
}

export async function create(input: CreateArabicTextInput) {
  const existing = await ArabicTextRepository.findByText(input.text);
  if (existing) throw ApiError.conflict("This Arabic text already exists");

  const arabicText = await ArabicTextRepository.create(input);
  await invalidateCacheNamespace(cacheNamespaces.arabicTexts);
  return arabicText;
}

export async function update(id: string, input: UpdateArabicTextInput) {
  await getById(id); // 404s early if it doesn't exist

  const arabicText = await ArabicTextRepository.update(id, input);
  await invalidateCacheNamespace(cacheNamespaces.arabicTexts);
  return arabicText;
}

export async function remove(id: string): Promise<void> {
  await getById(id);
  await ArabicTextRepository.delete(id);
  await invalidateCacheNamespace(cacheNamespaces.arabicTexts);
}

// Kicks off async AI enrichment for a piece of Arabic text.
// - Creates a bare ArabicText row (no linked Word/Sentence) with
//   aiStatus PENDING if this text hasn't been seen before.
// - If it has been seen and is COMPLETED, that's a conflict (already done).
// - If it exists but is PENDING/PROCESSING/FAILED, re-enqueue against the
//   same row instead of creating a duplicate.
export async function generate(
  input: GenerateArabicTextInput,
): Promise<GenerateArabicTextResponse> {
  const existing = await ArabicTextRepository.findByText(input.text);

  if (existing) {
    if (existing.aiStatus === "COMPLETED") {
      throw ApiError.conflict(
        "This Arabic text already has generated content",
      );
    }

    await enqueueArabicTextProcessing(existing.id);
    return { arabicTextId: existing.id, aiStatus: existing.aiStatus };
  }

  const arabicText = await ArabicTextRepository.create({
    text: input.text,
    aiStatus: "PENDING",
  });

  await enqueueArabicTextProcessing(arabicText.id);
  await invalidateCacheNamespace(cacheNamespaces.arabicTexts);

  return { arabicTextId: arabicText.id, aiStatus: arabicText.aiStatus };
}