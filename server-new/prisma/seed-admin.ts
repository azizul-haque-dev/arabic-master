import { PrismaPg } from '@prisma/adapter-pg';
import type { HashOptions } from 'argon2';
import * as argon2 from 'argon2';
import 'dotenv/config';
import pg from 'pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const hashOptions: HashOptions = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

export async function seedAdmin() {
  const fullName = process.env.ADMIN_NAME?.trim() ?? 'Admin User';
  const email =
    process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD?.trim() ?? 'admin1234';
  const databaseUrl = process.env.DATABASE_URL;

  if (!fullName || !email || !password || !databaseUrl) {
    throw new Error(
      'ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, and DATABASE_URL are required.',
    );
  }
  if (password.length < 8 || password.length > 128) {
    throw new Error('ADMIN_PASSWORD must be between 8 and 128 characters.');
  }

  const pool = new pg.Pool({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const passwordHash = await argon2.hash(password, hashOptions);
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        fullName,
        email,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      update: {
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      select: { id: true, email: true, role: true },
    });

    console.info(`Admin user ready: ${user.email} (${user.role})`);
    return user;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

try {
  await seedAdmin();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
