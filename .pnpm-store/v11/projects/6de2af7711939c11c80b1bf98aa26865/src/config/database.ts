// Single Prisma client instance for the whole process, backed by the
// node-postgres driver adapter. Reusing one instance avoids exhausting
// the connection pool, which is a common mistake when a new client
// gets created per-request.

import { PrismaClient } from "@/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";
import { logger } from "./logger.js";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

// Verifies the database is reachable before the server starts accepting traffic.
export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("Database connected");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Database disconnected");
}
