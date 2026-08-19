// Database access layer for conversation operations.
import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "../../config/database.js";
import {
  CreateConversationInput,
  UpdateConversationInput,
} from "./conversation.validation.js";

export const CONVERSATION_INCLUDE = {
  topicConversation: true,
  lines: {
    include: { sentence: { include: { arabic: true } } },
    orderBy: { position: "asc" },
  },
} satisfies Prisma.ConversationInclude;

export const ConversationRepository = {
  findMany: (
    where: Prisma.ConversationWhereInput,
    skip: number,
    take: number,
  ) =>
    prisma.conversation.findMany({
      where,
      include: CONVERSATION_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),

  count: (where: Prisma.ConversationWhereInput) =>
    prisma.conversation.count({ where }),

  findById: (id: string) =>
    prisma.conversation.findUnique({
      where: { id },
      include: CONVERSATION_INCLUDE,
    }),

  create: (data: CreateConversationInput) =>
    prisma.conversation.create({
      data: {
        topicConversationId: data.topicConversationId,
        lines: { create: data.lines },
      },
      include: CONVERSATION_INCLUDE,
    }),

  // Replaces all lines in one transaction when `lines` is provided, otherwise
  // just patches topicConversationId.
  update: (id: string, data: UpdateConversationInput) => {
    const { lines, topicConversationId } = data;

    if (!lines) {
      return prisma.conversation.update({
        where: { id },
        data: { ...(topicConversationId ? { topicConversationId } : {}) },
        include: CONVERSATION_INCLUDE,
      });
    }

    return prisma.$transaction(async (tx) => {
      await tx.conversationLine.deleteMany({ where: { conversationId: id } });
      await tx.conversationLine.createMany({
        data: lines.map((line) => ({ ...line, conversationId: id })),
      });
      return tx.conversation.update({
        where: { id },
        data: { ...(topicConversationId ? { topicConversationId } : {}) },
        include: CONVERSATION_INCLUDE,
      });
    });
  },

  delete: (id: string) => prisma.conversation.delete({ where: { id } }),
};
