import { eq } from 'drizzle-orm';
import { v7 as randomUUIDv7 } from 'uuid';
import { db, type Db, type Executor } from '../../database/db.js';
import * as schema from '../../database/drizzle/schema.js';

export type User = typeof schema.user.$inferSelect;

export const UserRepository= {
    async findByEmail(email: string, ex: Executor = db): Promise<User | null> {
      const [row] = await ex
        .select()
        .from(schema.user)
        .where(eq(schema.user.email, email))
        .limit(1);
      return row ?? null;
    },
    async findById(id: string, ex: Executor = db): Promise<User | null> {
      const [row] = await ex
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, id))
        .limit(1);
      return row ?? null;
    },
    async createWithPassword(
      data: { email: string; passwordHash: string; fullName: string },
      ex: Executor = db,
    ): Promise<User> {
      const [row] = await ex
        .insert(schema.user)
        .values({ id: randomUUIDv7(), ...data })
        .returning();
      return row;
    },
    async createFromOAuth(
      data: { email: string; fullName: string; emailVerifiedAt: Date | null },
      ex: Executor = db,
    ): Promise<User> {
      const [row] = await ex
        .insert(schema.user)
        .values({ id: randomUUIDv7(), ...data, passwordHash: null })
        .returning();
      return row;
    },
    async updatePassword(
      id: string,
      passwordHash: string,
      ex: Executor = db,
    ): Promise<void> {
      await ex
        .update(schema.user)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(schema.user.id, id));
    },
    async markEmailVerified(id: string, ex: Executor = db): Promise<void> {
      await ex
        .update(schema.user)
        .set({
          emailVerified: true,
          emailVerifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, id));
    },
  };
