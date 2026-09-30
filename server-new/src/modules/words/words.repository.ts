import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/drizzle/db.service.js';

export const WORD_INCLUDE = { entity: true };

@Injectable()
export class WordRepository {
  constructor(private readonly db: DatabaseService) {}

  findMany(where: Record<string, any>, skip: number, take: number) {
    return this.db.word.findMany({
      where,
      include: WORD_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  count(where: Record<string, any>) {
    return this.db.word.count({ where });
  }

  findById(id: string) {
    return this.db.word.findUnique({
      where: { id },
      include: WORD_INCLUDE,
    });
  }

  findFirstByEntityId(entityId: string) {
    return this.db.word.findFirst({
      where: { entityId },
      include: WORD_INCLUDE,
    });
  }

  create(entityId: string, data: Record<string, any>) {
    return this.db.word.create({
      data: { ...data, entityId },
      include: WORD_INCLUDE,
    });
  }

  update(id: string, data: Record<string, any>) {
    return this.db.word.update({
      where: { id },
      data,
      include: WORD_INCLUDE,
    });
  }

  delete(id: string) {
    return this.db.word.delete({ where: { id } });
  }
}
