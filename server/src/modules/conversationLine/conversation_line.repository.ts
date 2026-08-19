// Database access layer for conversation-line operations.
import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "../../config/database.js";

export const CONVERSATION_LINE_INCLUDE = {
  sentence: { include: { arabic: true } },
} satisfies Prisma.ConversationLineInclude;

export interface CreateConversationLineData {
  conversationId: string;
  sentenceId: string;
  speaker: string;
  position: number;
  meaningEn?: string;
  meaningBn?: string;
}

export interface UpdateConversationLineData {
  sentenceId?: string;
  speaker?: string;
  position?: number;
  meaningEn?: string;
  meaningBn?: string;
}

export const ConversationLineRepository = {
  findMany: (
    where: Prisma.ConversationLineWhereInput,
    skip: number,
    take: number,
  ) =>
    prisma.conversationLine.findMany({
      where,
      include: CONVERSATION_LINE_INCLUDE,
      orderBy: { position: "asc" },
      skip,
      take,
    }),

  count: (where: Prisma.ConversationLineWhereInput) =>
    prisma.conversationLine.count({ where }),

  findById: (id: string) =>
    prisma.conversationLine.findUnique({
      where: { id },
      include: CONVERSATION_LINE_INCLUDE,
    }),

  create: (data: CreateConversationLineData) =>
    prisma.conversationLine.create({
      data,
      include: CONVERSATION_LINE_INCLUDE,
    }),

  update: (id: string, data: UpdateConversationLineData) =>
    prisma.conversationLine.update({
      where: { id },
      data,
      include: CONVERSATION_LINE_INCLUDE,
    }),

  delete: (id: string) => prisma.conversationLine.delete({ where: { id } }),
};
