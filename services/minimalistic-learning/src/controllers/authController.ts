import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  signupSchema,
  loginSchema,
  passwordResetInitSchema,
  passwordResetCompleteSchema
} from '../validators/authValidator';
import * as userService from '../services/userService';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '../utils/jwt';
import {
  replaceRefreshToken,
  storeResetToken,
  verifyStoredToken,
  deleteToken,
  invalidateTokens,
  createTokenString
} from '../services/tokenService';
import { env } from '../config/env';
import { durationToMs } from '../utils/time';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import type {
  LoginResponseData,
  SignupResponseData,
  RefreshTokenResponseData,
  PasswordResetInitResponseData
} from '../types/auth.types';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const payload = signupSchema.parse(req.body) as userService.CreateUserPayload;

  const existing = await userService.findByEmail(payload.email);
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already in use');
  }

  const user = await userService.createUser(payload);

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse<SignupResponseData>(StatusCodes.CREATED, { user: userService.toPublicUser(user) }, "User signed up successfully")
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const credentials = loginSchema.parse(req.body);

  const user = await userService.findByEmail(credentials.email);
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const isPasswordValid = await user.comparePassword(credentials.password);
  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  await replaceRefreshToken(user._id, refreshToken, env.REFRESH_TOKEN_EXPIRE);

  const cookieBase = {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax' as const
  };

  res
    .cookie('access_token', accessToken, {
      ...cookieBase,
      maxAge: durationToMs(env.ACCESS_TOKEN_EXPIRE)
    })
    .cookie('refresh_token', refreshToken, {
      ...cookieBase,
      maxAge: durationToMs(env.REFRESH_TOKEN_EXPIRE)
    })
    .status(StatusCodes.OK)
    .json(
      new ApiResponse<LoginResponseData>(StatusCodes.OK, {
        user: userService.toPublicUser(user),
        tokens: {
          accessToken,
          refreshToken
        }
      }, "Login successful")
    );
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const tokenFromCookie = req.cookies?.refresh_token as string | undefined;
  const tokenFromBody = req.body?.refreshToken as string | undefined;

  const refreshTokenValue = tokenFromBody || tokenFromCookie;
  if (!refreshTokenValue) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Refresh token missing');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshTokenValue);
  } catch {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
  }

  const tokenDoc = await verifyStoredToken(payload.sub, refreshTokenValue, 'refresh');
  if (!tokenDoc) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token invalid or expired');
  }

  const user = await userService.findById(payload.sub);
  if (!user) {
    await deleteToken(tokenDoc);
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'User no longer exists');
  }

  await deleteToken(tokenDoc);

  const accessToken = signAccessToken(user.id);
  const newRefreshToken = signRefreshToken(user.id);

  await replaceRefreshToken(user.id, newRefreshToken, env.REFRESH_TOKEN_EXPIRE);

  const cookieBase = {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax' as const
  };

  res
    .cookie('access_token', accessToken, {
      ...cookieBase,
      maxAge: durationToMs(env.ACCESS_TOKEN_EXPIRE)
    })
    .cookie('refresh_token', newRefreshToken, {
      ...cookieBase,
      maxAge: durationToMs(env.REFRESH_TOKEN_EXPIRE)
    })
    .status(StatusCodes.OK)
    .json(
      new ApiResponse<RefreshTokenResponseData>(StatusCodes.OK, {
        accessToken,
        refreshToken: newRefreshToken
      }, "Tokens refreshed successfully")
    );
});

export const initiatePasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = passwordResetInitSchema.parse(req.body);

  const user = await userService.findByEmail(email);
  if (!user) {
    return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, null, 'If the email exists, a reset token has been sent.')
    );
  }

  const resetToken = createTokenString();
  await storeResetToken(user.id, resetToken, env.PASSWORD_RESET_EXPIRE);

  return res.status(StatusCodes.OK).json(
    new ApiResponse<PasswordResetInitResponseData>(StatusCodes.OK, { resetToken }, 'Password reset token generated successfully.')
  );
});

export const completePasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const payload = passwordResetCompleteSchema.parse(req.body);

  const user = await userService.findByEmail(payload.email);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired password reset token.');
  }

  const tokenDoc = await verifyStoredToken(user.id, payload.token, 'reset');
  if (!tokenDoc) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired password reset token.');
  }

  await userService.updatePassword(user, payload.password);
  await deleteToken(tokenDoc);
  await invalidateTokens(user.id, 'refresh');

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, 'Password updated successfully.')
  );
});
