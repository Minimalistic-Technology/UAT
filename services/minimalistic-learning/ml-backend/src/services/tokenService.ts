import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { prisma } from '../config/db';
import { Token } from '@prisma/client';
import { durationToMs } from '../utils/time';

// SQLite-compatible string constants (replaces Prisma enums)
const TOKEN_TYPE = { refresh: 'refresh', reset: 'reset' } as const;
type TokenTypeValue = typeof TOKEN_TYPE[keyof typeof TOKEN_TYPE];

const SALT_ROUNDS = 10;

export const createTokenString = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const createExpiryDate = (duration: string) => new Date(Date.now() + durationToMs(duration));

export const replaceRefreshToken = async (userId: string, tokenValue: string, expiresIn: string) => {
  await prisma.token.deleteMany({ where: { userId, type: TOKEN_TYPE.refresh } });
  return storeToken(userId, tokenValue, TOKEN_TYPE.refresh, expiresIn);
};

export const storeResetToken = async (userId: string, tokenValue: string, expiresIn: string) => {
  await prisma.token.deleteMany({ where: { userId, type: TOKEN_TYPE.reset } });
  return storeToken(userId, tokenValue, TOKEN_TYPE.reset, expiresIn);
};

export const invalidateTokens = (userId: string, type?: TokenTypeValue) => {
  if (type) {
    return prisma.token.deleteMany({ where: { userId, type } });
  }
  return prisma.token.deleteMany({ where: { userId } });
};

const storeToken = async (userId: string, tokenValue: string, type: TokenTypeValue, expiresIn: string) => {
  const tokenHash = await bcrypt.hash(tokenValue, SALT_ROUNDS);
  return prisma.token.create({
    data: {
      userId,
      tokenHash,
      type,
      expiresAt: createExpiryDate(expiresIn)
    }
  });
};

export const verifyStoredToken = async (
  userId: string,
  tokenValue: string,
  type: TokenTypeValue
): Promise<Token | null> => {
  const tokenDoc = await prisma.token.findFirst({
    where: { userId, type },
    orderBy: { createdAt: 'desc' }
  });

  if (!tokenDoc) {
    return null;
  }

  const isValid = await bcrypt.compare(tokenValue, tokenDoc.tokenHash);
  if (!isValid) {
    return null;
  }

  if (tokenDoc.expiresAt.getTime() < Date.now()) {
    await prisma.token.deleteMany({ where: { id: tokenDoc.id } });
    return null;
  }

  return tokenDoc;
};

export const deleteToken = (tokenDoc: Token) => prisma.token.deleteMany({ where: { id: tokenDoc.id } });
