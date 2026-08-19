import { prisma } from "@/config/database.js";
import { Prisma } from "@/generated/prisma/client.js";

export const TOPIC_INCLUDE = {
  _count: { select: { conversations: true } },
} satisfies Prisma.TopicInclude;

// flattens the _ count relation into a plain conversation count field
export function presentTopic(
  topic: Prisma.TopicGetPayload<{ include: typeof TOPIC_INCLUDE }>,
) {
  const { _count, ...rest } = topic;
  return { ...rest, conversationCount: _count.conversations };
}

export const TopicRepository = {
  // find the list
  findMany: (where: Prisma.TopicWhereInput, skip: number, take: number) => {
    return prisma.topic.findMany({
      where,
      include: TOPIC_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  },
  // find by id
  findById: (id: string) =>
    prisma.topic.findUnique({ where: { id }, include: TOPIC_INCLUDE }),
  // find by title
  findByTitleEn: (titleEn: string) =>
    prisma.topic.findFirst({ where: { titleEn }, include: TOPIC_INCLUDE }),
  // create new
  create: (data: { titleEn: string; titleBn?: string }) => {
    return prisma.topic.create({ data, include: TOPIC_INCLUDE });
  },
  // update
  update: (id: string, data: { titleEn?: string; titleBn?: string }) => {
    return prisma.topic.update({ where: { id }, data, include: TOPIC_INCLUDE });
  },
  // delete
  delete: (id: string) => prisma.topic.delete({ where: { id } }),
};
