import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js"

const connectionString = `${process.env.DATABASE_URL}`;

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient;
  pool: pg.Pool;
};

const pool = globalForPrisma.pool || new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

export { prisma };