import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/drizzle/db.service.js';
import type { InferSelectModel } from 'drizzle-orm';
import * as schema from '../../database/drizzle/schema.js';
import { SafeUser } from './types/safe-user.type.js';

export type User = InferSelectModel<typeof schema.user>;

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  createWithPassword(
    data: { email: string; passwordHash: string; fullName: string },
    tx?: DatabaseService,
  ): Promise<User> {
    const client = tx ?? this.db;
    return client.user.create({ data });
  }

  createFromOAuth(
    data: { email: string; fullName: string; emailVerifiedAt: Date | null },
    tx: DatabaseService,
  ): Promise<User> {
    return tx.user.create({ data: { ...data, passwordHash: null } });
  }

  toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
    };
  }
}
