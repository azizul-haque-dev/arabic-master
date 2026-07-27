import { prisma } from "@/config/database.js";
import { ApiError } from "@/utils/api-error.js";
import {
  cacheGet,
  cacheKey,
  cacheNamespaces,
  cacheSet,
  invalidateCacheNamespace,
} from "@/utils/cache.js";
import { createCategorySchema } from "./category.validation.js";

export async function list() {
  const key = cacheKey(cacheNamespaces.categories);
  const cached = await cacheGet<Awaited<ReturnType<typeof prisma.category.findMany>>>(key);
  if (cached) return cached;

  const categories = await prisma.category.findMany({ orderBy: { nameEn: "asc" } });
  await cacheSet(key, categories, 600);
  return categories;
}

export async function getById(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw ApiError.notFound("Category not found");
  return category;
}

export async function create(data: { nameEn: string; nameBn: string }) {
  const category = await prisma.category.create({ data });
  await invalidateCategoryRelatedCaches();
  return category;
}

export async function update(
  id: string,
  data: { nameEn?: string; nameBn?: string },
) {
  await getById(id); // 404s early if it doesn't exist
  const category = await prisma.category.update({ where: { id }, data });
  await invalidateCategoryRelatedCaches();
  return category;
}

export async function remove(id: string): Promise<void> {
  await getById(id);
  await prisma.category.delete({ where: { id } });
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

  const existingCategory = await prisma.category.findUnique({
    where: {
      nameEn: normalizedCategoryEn,
    },
  });

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

  const createNew = await prisma.category.create({
    data: validation.data,
  });
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
