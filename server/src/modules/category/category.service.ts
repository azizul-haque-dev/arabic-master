import { ApiError } from "@/lib/api-error.js";
import {
  cacheGet,
  cacheKey,
  cacheNamespaces,
  cacheSet,
  invalidateCacheNamespace,
} from "@/integrations/cache.js";
import { createCategorySchema } from "./category.validation.js";
import { CategoryRepository } from "./category.repository.js";

export async function list() {
  const key = cacheKey(cacheNamespaces.categories);
  const cached = await cacheGet<Awaited<ReturnType<typeof CategoryRepository.findMany>>>(key);
  if (cached) return cached;

  const categories = await CategoryRepository.findMany();
  await cacheSet(key, categories, 600);
  return categories;
}

export async function getById(id: string) {
  const category = await CategoryRepository.findById(id);
  if (!category) throw ApiError.notFound("Category not found");
  return category;
}

export async function create(data: { nameEn: string; nameBn: string }) {
  const category = await CategoryRepository.create(data);
  await invalidateCategoryRelatedCaches();
  return category;
}

export async function update(
  id: string,
  data: { nameEn?: string; nameBn?: string },
) {
  await getById(id); // 404s early if it doesn't exist
  const category = await CategoryRepository.update(id, data);
  await invalidateCategoryRelatedCaches();
  return category;
}

export async function remove(id: string): Promise<void> {
  await getById(id);
  await CategoryRepository.delete(id);
  await invalidateCategoryRelatedCaches();
}

interface GetOrCreateCategoryInput {
  categoryEn: string;
  categoryBn: string;
}

export async function getOrCreateCategory({
  categoryEn,
  categoryBn,
}: GetOrCreateCategoryInput): Promise<string> {
  const normalizedCategoryEn = categoryEn.toLowerCase().trim();

  const existingCategory = await CategoryRepository.findByNameEn(
    normalizedCategoryEn,
  );

  if (existingCategory) {
    return existingCategory.id;
  }

  const categoryData = {
    nameEn: normalizedCategoryEn,
    nameBn: categoryBn.trim(),
  };

  const validation = createCategorySchema.safeParse(categoryData);

  if (!validation.success) {
    throw ApiError.badRequest("Validation failed", validation.error.flatten());
  }

  const createNew = await CategoryRepository.create(validation.data);
  await invalidateCategoryRelatedCaches();
  return createNew.id;
}

async function invalidateCategoryRelatedCaches() {
  await Promise.all([
    invalidateCacheNamespace(cacheNamespaces.categories),
    invalidateCacheNamespace(cacheNamespaces.words),
    invalidateCacheNamespace(cacheNamespaces.sentences),
  ]);
}
