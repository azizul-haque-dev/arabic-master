import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../database/drizzle/db.service.js';
import type { DatabaseTransaction } from '../../database/drizzle/db.service.js';
import * as schema from '../../database/drizzle/schema.js';
import { SafeUser } from './types/safe-user.type.js';

export type User = InferSelectModel<typeof schema.user>;

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1);

    return rows[0] ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const rows = await this.db.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async createWithPassword(
    data: { email: string; passwordHash: string; fullName: string },
    tx?: DatabaseTransaction,
  ): Promise<User> {
    const client = tx ?? this.db.db;
    const rows = await client
      .insert(schema.user)
      .values({ id: randomUUID(), ...data })
      .returning();
    return rows[0] as User;
  }

  async createFromOAuth(
    data: { email: string; fullName: string; emailVerifiedAt: Date | null },
    tx: DatabaseTransaction,
  ): Promise<User> {
    const rows = await tx
      .insert(schema.user)
      .values({ id: randomUUID(), ...data, passwordHash: null })
      .returning();

    return rows[0] as User;
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
