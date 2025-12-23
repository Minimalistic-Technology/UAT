import crypto from 'crypto';
import bcrypt from 'bcrypt';
import Token, { TokenType, TokenDocument } from '../models/Token';
import { durationToMs } from '../utils/time';

const SALT_ROUNDS = 10;

export const createTokenString = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const createExpiryDate = (duration: string) => new Date(Date.now() + durationToMs(duration));

export const replaceRefreshToken = async (userId: string, tokenValue: string, expiresIn: string) => {
  await Token.deleteMany({ user: userId, type: 'refresh' });
  return storeToken(userId, tokenValue, 'refresh', expiresIn);
};

export const storeResetToken = async (userId: string, tokenValue: string, expiresIn: string) => {
  await Token.deleteMany({ user: userId, type: 'reset' });
  return storeToken(userId, tokenValue, 'reset', expiresIn);
};

export const invalidateTokens = (userId: string, type?: TokenType) => {
  if (type) {
    return Token.deleteMany({ user: userId, type });
  }
  return Token.deleteMany({ user: userId });
};

const storeToken = async (userId: string, tokenValue: string, type: TokenType, expiresIn: string) => {
  const tokenHash = await bcrypt.hash(tokenValue, SALT_ROUNDS);
  return Token.create({
    user: userId,
    tokenHash,
    type,
    expiresAt: createExpiryDate(expiresIn)
  });
};

export const verifyStoredToken = async (
  userId: string,
  tokenValue: string,
  type: TokenType
): Promise<TokenDocument | null> => {
  const tokenDoc = await Token.findOne({ user: userId, type }).sort({ createdAt: -1 });
  if (!tokenDoc) {
    return null;
  }

  const isValid = await bcrypt.compare(tokenValue, tokenDoc.tokenHash);
  if (!isValid) {
    return null;
  }

  if (tokenDoc.expiresAt.getTime() < Date.now()) {
    await tokenDoc.deleteOne();
    return null;
  }

  return tokenDoc;
};

export const deleteToken = (tokenDoc: TokenDocument) => tokenDoc.deleteOne();


