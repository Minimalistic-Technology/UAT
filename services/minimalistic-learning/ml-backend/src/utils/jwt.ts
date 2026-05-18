import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

const accessSecret = env.JWT_ACCESS_SECRET as Secret;
const refreshSecret = env.JWT_REFRESH_SECRET as Secret;

const accessTokenOptions: SignOptions = {
  expiresIn: env.ACCESS_TOKEN_EXPIRE as SignOptions['expiresIn']
};

const refreshTokenOptions: SignOptions = {
  expiresIn: env.REFRESH_TOKEN_EXPIRE as SignOptions['expiresIn']
};

export const signAccessToken = (userId: string) =>
  jwt.sign(
    { sub: userId, type: 'access' } satisfies AccessTokenPayload,
    accessSecret,
    accessTokenOptions
  );

export const signRefreshToken = (userId: string) =>
  jwt.sign(
    { sub: userId, type: 'refresh' } satisfies RefreshTokenPayload,
    refreshSecret,
    refreshTokenOptions
  );

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, accessSecret) as AccessTokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, refreshSecret) as RefreshTokenPayload;
