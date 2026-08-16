// Database access layer for category operations.

import { prisma } from "../../config/database.js";

export const CategoryRepository = {
  findMany: () =>
    prisma.category.findMany({
      orderBy: { nameEn: "asc" },
    }),

  findById: (id: string) =>
    prisma.category.findUnique({
      where: { id },
    }),

  findByNameEn: (nameEn: string) =>
    prisma.category.findUnique({
      where: { nameEn },
    }),

  create: (data: { nameEn: string; nameBn: string }) =>
    prisma.category.create({ data }),

  update: (id: string, data: { nameEn?: string; nameBn?: string }) =>
    prisma.category.update({
      where: { id },
      data,
    }),

  delete: (id: string) =>
    prisma.category.delete({
      where: { id },
    }),
};
