import { PrismaClient } from '@prisma/client';
import { env } from './env';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('[db] Connected to PostgreSQL (Neon) Successfully');
  } catch (error) {
    console.error('[db] Connection failed', error);
    process.exit(1);
  }
};



