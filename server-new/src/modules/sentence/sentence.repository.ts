import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/drizzle/db.service.js';

export const SENTENCE_INCLUDE = {
  entity: true,
  words: {
    include: { word: { include: { entity: true } } },
    orderBy: { position: 'asc' },
  },
};

@Injectable()
export class SentenceRepository {
  constructor(private readonly db: DatabaseService) {}

  findMany(where: Record<string, any>, skip: number, take: number) {
    return this.db.sentence.findMany({
      where,
      include: SENTENCE_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  count(where: Record<string, any>) {
    return this.db.sentence.count({ where });
  }

  findById(id: string) {
    return this.db.sentence.findUnique({
      where: { id },
      include: SENTENCE_INCLUDE,
    });
  }

  findFirstByEntityId(entityId: string) {
    return this.db.sentence.findFirst({
      where: { entityId },
      include: SENTENCE_INCLUDE,
    });
  }

  create(entityId: string, data: Record<string, any>) {
    return this.db.sentence.create({
      data: { ...data, entityId },
      include: SENTENCE_INCLUDE,
    });
  }

  update(id: string, data: Record<string, any>) {
    return this.db.sentence.update({
      where: { id },
      data,
      include: SENTENCE_INCLUDE,
    });
  }

  delete(id: string) {
    return this.db.sentence.delete({ where: { id } });
  }

  async replaceWords(sentenceId: string, words: { wordId: string; position: number }[]) {
    return this.db.$transaction(async (tx) => {
      await tx.sentenceWord.deleteMany({ where: { sentenceId } });
      if (words.length) {
        await tx.sentenceWord.createMany({
          data: words.map((w) => ({ sentenceId, ...w })),
        });
      }
      return tx.sentence.findUnique({
        where: { id: sentenceId },
        include: SENTENCE_INCLUDE,
      });
    });
  }
}
