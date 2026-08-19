// Database access layer for topic-conversation operations.
import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import { UpdateTopicConversationInput } from "./topic_conversation.validation.js";

export const TOPIC_CONVERSATION_INCLUDE = {
  topic: true,
  _count: { select: { conversations: true } },
} satisfies Prisma.TopicConversationInclude;

// Flattens the _count relation into a plain conversationCount field.
export function presentTopicConversation(
  topicConversation: Prisma.TopicConversationGetPayload<{
    include: typeof TOPIC_CONVERSATION_INCLUDE;
  }>,
) {
  const { _count, ...rest } = topicConversation;
  return { ...rest, conversationCount: _count.conversations };
}

export const TopicConversationRepository = {
  findMany: (
    where: Prisma.TopicConversationWhereInput,
    skip: number,
    take: number,
  ) =>
    prisma.topicConversation.findMany({
      where,
      include: TOPIC_CONVERSATION_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),

  count: (where: Prisma.TopicConversationWhereInput) =>
    prisma.topicConversation.count({ where }),

  findById: (id: string) =>
    prisma.topicConversation.findUnique({
      where: { id },
      include: TOPIC_CONVERSATION_INCLUDE,
    }),

  create: (data: { topicId: string; titleEn: string; titleBn?: string }) =>
    prisma.topicConversation.create({
      data,
      include: TOPIC_CONVERSATION_INCLUDE,
    }),

  update: (id: string, data: UpdateTopicConversationInput) =>
    prisma.topicConversation.update({
      where: { id },
      data,
      include: TOPIC_CONVERSATION_INCLUDE,
    }),

  delete: (id: string) => prisma.topicConversation.delete({ where: { id } }),
};
