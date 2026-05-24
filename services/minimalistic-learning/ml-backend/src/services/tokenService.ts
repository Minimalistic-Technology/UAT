import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { prisma } from '../config/db';
import { durationToMs } from '../utils/time';

type TokenType = 'refresh' | 'reset';

// Get the Token type from the prisma result (non-null version)
type Token = Exclude<Awaited<ReturnType<typeof prisma.token.findFirst>>, null>;

const SALT_ROUNDS = 10;

export const createTokenString = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const createExpiryDate = (duration: string) => new Date(Date.now() + durationToMs(duration));

export const replaceRefreshToken = async (userId: string, tokenValue: string, expiresIn: string) => {
  await prisma.token.deleteMany({ where: { userId, type: 'refresh' } });
  return storeToken(userId, tokenValue, 'refresh', expiresIn);
};

export const storeResetToken = async (userId: string, tokenValue: string, expiresIn: string) => {
  await prisma.token.deleteMany({ where: { userId, type: 'reset' } });
  return storeToken(userId, tokenValue, 'reset', expiresIn);
};

export const invalidateTokens = (userId: string, type?: TokenType) => {
  if (type) {
    return prisma.token.deleteMany({ where: { userId, type } });
  }
  return prisma.token.deleteMany({ where: { userId } });
};

const storeToken = async (userId: string, tokenValue: string, type: TokenType, expiresIn: string) => {
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
  type: TokenType
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
    await prisma.token.delete({ where: { id: tokenDoc.id } });
    return null;
  }

  return tokenDoc;
};

export const deleteToken = (tokenDoc: Token) => prisma.token.delete({ where: { id: tokenDoc.id } });
