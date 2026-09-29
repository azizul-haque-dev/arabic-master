import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';

export const SENTENCE_INCLUDE = {
  entity: true,
  words: {
    include: { word: { include: { entity: true } } },
    orderBy: { position: 'asc' },
  },
} satisfies Prisma.SentenceInclude;

export type SentenceWithRelations = Prisma.SentenceGetPayload<{
  include: typeof SENTENCE_INCLUDE;
}>;

@Injectable()
export class SentenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(where: Prisma.SentenceWhereInput, skip: number, take: number) {
    return this.prisma.sentence.findMany({
      where,
      include: SENTENCE_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  count(where: Prisma.SentenceWhereInput) {
    return this.prisma.sentence.count({ where });
  }

  findById(id: string) {
    return this.prisma.sentence.findUnique({
      where: { id },
      include: SENTENCE_INCLUDE,
    });
  }

  // entityId has no @unique in the schema — same as Word, we enforce
  // "one Sentence per Entity" ourselves.
  findFirstByEntityId(entityId: string) {
    return this.prisma.sentence.findFirst({
      where: { entityId },
      include: SENTENCE_INCLUDE,
    });
  }

  create(
    entityId: string,
    data: Omit<Prisma.SentenceUncheckedCreateInput, 'entityId'>,
  ) {
    return this.prisma.sentence.create({
      data: { ...data, entityId },
      include: SENTENCE_INCLUDE,
    });
  }

  update(id: string, data: Prisma.SentenceUpdateInput) {
    return this.prisma.sentence.update({
      where: { id },
      data,
      include: SENTENCE_INCLUDE,
    });
  }

  delete(id: string) {
    return this.prisma.sentence.delete({ where: { id } });
  }

  // Replaces the sentence's full word list in one transaction.
  // skipDuplicates guards the @@unique([sentenceId, wordId]) constraint —
  // if the same word appears twice, only the first insert wins.
  async replaceWords(
    sentenceId: string,
    words: { wordId: string; position: number }[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.sentenceWord.deleteMany({ where: { sentenceId } });
      if (words.length) {
        await tx.sentenceWord.createMany({
          data: words.map((w) => ({ sentenceId, ...w })),
          skipDuplicates: true,
        });
      }
      return tx.sentence.findUnique({
        where: { id: sentenceId },
        include: SENTENCE_INCLUDE,
      });
    });
  }
}
