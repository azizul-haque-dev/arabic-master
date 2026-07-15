import { prisma } from "@/config/database.js";
import { ApiError } from "@/utils/api-error.js";
import { createCategorySchema } from "./category.validation.js";

export async function list() {
  return prisma.category.findMany({ orderBy: { nameEn: "asc" } });
}

export async function getById(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw ApiError.notFound("Category not found");
  return category;
}

export async function create(data: { nameEn: string; nameBn: string }) {
  return prisma.category.create({ data });
}

export async function update(
  id: string,
  data: { nameEn?: string; nameBn?: string },
) {
  await getById(id); // 404s early if it doesn't exist
  return prisma.category.update({ where: { id }, data });
}

export async function remove(id: string): Promise<void> {
  await getById(id);
  await prisma.category.delete({ where: { id } });
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
  return createNew.id;
}
