import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  signupSchema,
  loginSchema,
  passwordResetInitSchema,
  passwordResetCompleteSchema,
  verifyOTPSchema
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
import { getCookieConfig } from '../config/cookieConfig';
import { durationToMs } from '../utils/time';
import { ApiResponse } from "../utils/ApiResponse";
import { sendOTP } from "../utils/email";
import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
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

  let user;
  try {
    user = await userService.createUser(payload);

    // Generate OTP for signup verification
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send verification email
    await sendOTP(user.email, otp);

    return res.status(StatusCodes.CREATED).json(
      new ApiResponse(StatusCodes.CREATED, { email: user.email }, "Account created! Please verify your email with the OTP sent.")
    );
  } catch (err: any) {
    if (err.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already in use');
    }
    throw err;
  }
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

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save to user
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  // Send Email
  await sendOTP(user.email, otp);

  const message = user.isVerified 
    ? "OTP sent to your email. Please verify." 
    : "Please verify your account. OTP sent to your email.";

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { email: user.email, isVerified: user.isVerified }, message)
  );
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = verifyOTPSchema.parse(req.body);

  const user = await userService.findByEmail(email);
  if (!user || !user.otp || !user.otpExpires) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid request or OTP expired');
  }

  // Check if OTP matches and not expired
  if (user.otp !== otp || new Date() > user.otpExpires) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired OTP');
  }

  // Clear OTP fields
  user.otp = undefined;
  user.otpExpires = undefined;
  user.isVerified = true; // Mark as verified
  await user.save();

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  await replaceRefreshToken(user._id, refreshToken, env.REFRESH_TOKEN_EXPIRE);

  const cookieBase = getCookieConfig();

  return res
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
    console.log(`[auth] Refresh token not found in DB for user ${payload.sub}`);
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token invalid or expired');
  }

  const user = await userService.findById(payload.sub);
  if (!user) {
    console.log(`[auth] User ${payload.sub} not found for refresh token`);
    await deleteToken(tokenDoc);
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'User no longer exists');
  }

  console.log(`[auth] Successfully refreshing tokens for user: ${user.email}`);
  await deleteToken(tokenDoc);

  const accessToken = signAccessToken(user.id);
  const newRefreshToken = signRefreshToken(user.id);

  await replaceRefreshToken(user.id, newRefreshToken, env.REFRESH_TOKEN_EXPIRE);

  const cookieBase = getCookieConfig();

  return res
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

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found");
  }

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { user: userService.toPublicUser(user) }, "User profile fetched successfully")
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const cookieBase = getCookieConfig();

  return res
    .clearCookie('access_token', cookieBase)
    .clearCookie('refresh_token', cookieBase)
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, "Logged out successfully"));
});


