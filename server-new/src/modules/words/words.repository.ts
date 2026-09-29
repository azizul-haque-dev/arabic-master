import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';

export const WORD_INCLUDE = { entity: true } satisfies Prisma.WordInclude;
export type WordWithEntity = Prisma.WordGetPayload<{
  include: typeof WORD_INCLUDE;
}>;

// This is the ONLY file allowed to write raw Prisma queries for Word.
// Every other file (service, controller, worker) talks to the database
// through these methods — that keeps Prisma details in one place, so if
// the schema changes again later, you fix it in one file, not ten.
@Injectable()
export class WordRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(where: Prisma.WordWhereInput, skip: number, take: number) {
    return this.prisma.word.findMany({
      where,
      include: WORD_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  count(where: Prisma.WordWhereInput) {
    return this.prisma.word.count({ where });
  }

  findById(id: string) {
    return this.prisma.word.findUnique({
      where: { id },
      include: WORD_INCLUDE,
    });
  }

  // Your schema does NOT put @unique on Word.entityId, so nothing stops
  // two Words pointing at the same Entity at the database level. We
  // enforce the "one Word per Entity" rule ourselves here — same job your
  // old findByArabicId() did.
  findFirstByEntityId(entityId: string) {
    return this.prisma.word.findFirst({
      where: { entityId },
      include: WORD_INCLUDE,
    });
  }

  create(
    entityId: string,
    data: Omit<Prisma.WordUncheckedCreateInput, 'entityId'>,
  ) {
    return this.prisma.word.create({
      data: { ...data, entityId },
      include: WORD_INCLUDE,
    });
  }

  update(id: string, data: Prisma.WordUpdateInput) {
    return this.prisma.word.update({
      where: { id },
      data,
      include: WORD_INCLUDE,
    });
  }

  delete(id: string) {
    return this.prisma.word.delete({ where: { id } });
  }
}
