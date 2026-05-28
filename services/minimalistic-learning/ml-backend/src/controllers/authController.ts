import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/db';
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
import { sendOTP, sendPasswordResetOTP, sendAccountCreatedEmail, sendLoginAlertEmail } from "../utils/email";
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import type {
  LoginResponseData,
  SignupResponseData,
  RefreshTokenResponseData,
  PasswordResetInitResponseData
} from '../types/auth.types';

interface LockoutInfo {
  attempts: number;
  lockUntil: Date | null;
}

const loginLockoutMap = new Map<string, LockoutInfo>();
const otpLockoutMap = new Map<string, LockoutInfo>();

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const payload = signupSchema.parse(req.body) as userService.CreateUserPayload;
  const emailKey = payload.email.toLowerCase().trim();

  // Check OTP lockout
  const otpLockout = otpLockoutMap.get(emailKey);
  if (otpLockout && otpLockout.lockUntil && otpLockout.lockUntil > new Date()) {
    const minLeft = Math.ceil((otpLockout.lockUntil.getTime() - Date.now()) / 1000 / 60);
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      `Too many OTP requests. Signup is blocked. Please try again after ${minLeft} minute(s).`
    );
  }

  // Verify Google reCAPTCHA
  const recaptchaSecret = env.RECAPTCHA_SECRET_KEY || "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"; // Default test secret
  const recaptchaToken = (payload as any).recaptchaToken;

  if (!recaptchaToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "CAPTCHA verification is required.");
  }

  try {
    const axios = require('axios');
    const verifyRes = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`
    );
    if (!verifyRes.data.success) {
      throw new Error("CAPTCHA challenge failed");
    }
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "CAPTCHA verification failed. Are you a robot?");
  }

  const existing = await userService.findByEmail(payload.email);
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already in use');
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiration

  let hashedPassword = payload.password;
  if (payload.password) {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(payload.password, salt);
  }

  await prisma.pendingUser.upsert({
    where: { email: payload.email },
    update: { ...payload, password: hashedPassword, otp, otpExpires: new Date(otpExpires) },
    create: { ...payload, password: hashedPassword, otp, otpExpires: new Date(otpExpires) }
  });

  sendOTP(payload.email, otp).catch((err) => {
    console.error('[Background] Failed to send signup OTP email:', err);
  });

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(StatusCodes.CREATED, { email: payload.email }, "Verification code sent! Please verify your email to complete registration.")
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const credentials = loginSchema.parse(req.body);
  const emailKey = credentials.email.toLowerCase().trim();

  // Check login lockout
  const loginLockout = loginLockoutMap.get(emailKey);
  if (loginLockout && loginLockout.lockUntil && loginLockout.lockUntil > new Date()) {
    const minLeft = Math.ceil((loginLockout.lockUntil.getTime() - Date.now()) / 1000 / 60);
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      `Too many failed login attempts. Your login request is blocked. Please try again after ${minLeft} minute(s).`
    );
  }

  const user = await userService.findByEmail(credentials.email);
  if (!user) {
    // Record login failure for query targeting non-existing logins too to protect enumeration
    const current = loginLockoutMap.get(emailKey) || { attempts: 0, lockUntil: null };
    current.attempts += 1;
    if (current.attempts >= 3) {
      const lockMinutes = Math.min(60, Math.pow(2, current.attempts - 3) * 2);
      current.lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
      loginLockoutMap.set(emailKey, current);
    } else {
      loginLockoutMap.set(emailKey, current);
    }
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
  if (!isPasswordValid) {
    // Record login failure
    const current = loginLockoutMap.get(emailKey) || { attempts: 0, lockUntil: null };
    current.attempts += 1;
    if (current.attempts >= 3) {
      const lockMinutes = Math.min(60, Math.pow(2, current.attempts - 3) * 2);
      current.lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
      loginLockoutMap.set(emailKey, current);
      throw new ApiError(
        StatusCodes.TOO_MANY_REQUESTS,
        `Too many failed login attempts. Your account has been temporarily locked for ${lockMinutes} minutes.`
      );
    } else {
      loginLockoutMap.set(emailKey, current);
      const remaining = 3 - current.attempts;
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        `Invalid credentials. ${remaining} attempt(s) remaining before block.`
      );
    }
  }

  // Clear login lockout on successful password match
  loginLockoutMap.delete(emailKey);

  const detectedRole = user.role?.toString().trim().toLowerCase();
  console.log(`[auth] Login attempt: ${user.email}, Detected Role: ${detectedRole}`);

  if (detectedRole === 'admin') {
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await replaceRefreshToken(user.id, refreshToken, env.REFRESH_TOKEN_EXPIRE);
    const cookieBase = getCookieConfig();

    sendLoginAlertEmail(user.email, user.firstName, req.ip, req.headers['user-agent']).catch(console.error);

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
          tokens: { accessToken, refreshToken }
        }, "Admin login successful")
      );
  }

  // Check OTP request lockout
  const otpLockout = otpLockoutMap.get(emailKey);
  if (otpLockout && otpLockout.lockUntil && otpLockout.lockUntil > new Date()) {
    const minLeft = Math.ceil((otpLockout.lockUntil.getTime() - Date.now()) / 1000 / 60);
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      `Too many OTP requests. Please wait ${minLeft} minute(s) before logging in again.`
    );
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiration

  await prisma.user.update({
    where: { id: user.id },
    data: { otp, otpExpires: new Date(otpExpires) }
  });

  sendOTP(user.email, otp).catch((err) => {
    console.error('[Background] Failed to send login OTP email:', err);
  });

  const message = user.isVerified
    ? "OTP sent to your email. Please verify."
    : "Please verify your account. OTP sent to your email.";

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { email: user.email, isVerified: user.isVerified, requiresOTP: true }, message)
  );
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = verifyOTPSchema.parse(req.body);
  const emailKey = email.toLowerCase().trim();

  // Check OTP lockout
  const otpLockout = otpLockoutMap.get(emailKey);
  if (otpLockout && otpLockout.lockUntil && otpLockout.lockUntil > new Date()) {
    const minLeft = Math.ceil((otpLockout.lockUntil.getTime() - Date.now()) / 1000 / 60);
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      `Too many incorrect OTP attempts. Your validation is blocked. Please try again after ${minLeft} minute(s).`
    );
  }

  let user: any = null;
  user = await userService.findByEmail(email);

  if (user) {
    const isExpired = user.otpExpires && new Date(Date.now() - 5000) > user.otpExpires;
    if (user.otp !== otp || isExpired) {
      // Record OTP verification failure
      const current = otpLockoutMap.get(emailKey) || { attempts: 0, lockUntil: null };
      current.attempts += 1;
      if (current.attempts >= 3) {
        const lockMinutes = Math.min(60, Math.pow(2, current.attempts - 3) * 2);
        current.lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
        otpLockoutMap.set(emailKey, current);
        throw new ApiError(
          StatusCodes.TOO_MANY_REQUESTS,
          `Too many incorrect/expired OTP attempts. Verification blocked for ${lockMinutes} minutes.`
        );
      } else {
        otpLockoutMap.set(emailKey, current);
        const remaining = 3 - current.attempts;
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Invalid or expired OTP. ${remaining} attempt(s) remaining.`
        );
      }
    }

    // Clear lockout on success
    otpLockoutMap.delete(emailKey);

    user = await prisma.user.update({
      where: { id: user.id },
      data: { otp: null, otpExpires: null, isVerified: true }
    });

    sendLoginAlertEmail(user.email, user.firstName, req.ip, req.headers['user-agent']).catch(console.error);
  } else {
    const pending = await prisma.pendingUser.findUnique({ where: { email } });
    const isExpired = pending && new Date(Date.now() - 5000) > pending.otpExpires;

    if (!pending || pending.otp !== otp || isExpired) {
      // Record OTP verification failure
      const current = otpLockoutMap.get(emailKey) || { attempts: 0, lockUntil: null };
      current.attempts += 1;
      if (current.attempts >= 3) {
        const lockMinutes = Math.min(60, Math.pow(2, current.attempts - 3) * 2);
        current.lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
        otpLockoutMap.set(emailKey, current);
        throw new ApiError(
          StatusCodes.TOO_MANY_REQUESTS,
          `Too many incorrect/expired OTP attempts. Verification blocked for ${lockMinutes} minutes.`
        );
      } else {
        otpLockoutMap.set(emailKey, current);
        const remaining = 3 - current.attempts;
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Invalid or expired OTP. ${remaining} attempt(s) remaining.`
        );
      }
    }

    // Clear lockout on success
    otpLockoutMap.delete(emailKey);

    const { id, otp: _o, otpExpires: _e, createdAt: _c, password, ...userData } = pending;

    user = await prisma.user.create({
      data: {
        ...userData,
        password: password || "",
        lastName: userData.lastName || "",
        contactNumber: userData.contactNumber || "",
        isVerified: true
      }
    });

    await prisma.pendingUser.delete({ where: { id: pending.id } });
    sendAccountCreatedEmail(user.email, user.firstName).catch(console.error);
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  await replaceRefreshToken(user.id, refreshToken, env.REFRESH_TOKEN_EXPIRE);

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
        tokens: { accessToken, refreshToken }
      }, "Verification successful")
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
    throw new ApiError(StatusCodes.NOT_FOUND, 'User with this email address does not exist.');
  }

  const resetOTP = crypto.randomInt(100000, 999999).toString();

  await storeResetToken(user.id, resetOTP, env.PASSWORD_RESET_EXPIRE || '15m');

  sendPasswordResetOTP(email, resetOTP).catch((err) => {
    console.error('[Background] Failed to send password reset OTP:', err);
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { email }, 'A password reset code has been sent to your email.')
  );
});

export const completePasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const payload = passwordResetCompleteSchema.parse(req.body);

  const user = await userService.findByEmail(payload.email);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user or expired token.');
  }

  const tokenDoc = await verifyStoredToken(user.id, payload.token, 'reset');
  if (!tokenDoc) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired password reset verification code.');
  }

  await userService.updatePassword(user, payload.password);
  await deleteToken(tokenDoc);

  await invalidateTokens(user.id, 'refresh');

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, 'Your password has been successfully reset.')
  );
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found");
  }

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { user: userService.toPublicUser(user as any) }, "User profile fetched successfully")
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
    path: '/'
  };

  return res
    .clearCookie('access_token', cookieOptions)
    .clearCookie('refresh_token', cookieOptions)
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, "Logged out successfully"));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user: any = req.user!;
  const { firstName, lastName, contactNumber, currentPassword, newPassword } = req.body;

  const dataToUpdate: any = {};
  if (firstName && firstName.trim()) dataToUpdate.firstName = firstName.trim();
  if (lastName && lastName.trim()) dataToUpdate.lastName = lastName.trim();
  if (contactNumber && contactNumber.trim()) dataToUpdate.contactNumber = contactNumber.trim();

  if (newPassword) {
    if (!currentPassword) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Current password is required to set a new password');
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Current password is incorrect');
    }
    if (newPassword.length < 8) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'New password must be at least 8 characters');
    }
    const salt = await bcrypt.genSalt(10);
    dataToUpdate.password = await bcrypt.hash(newPassword, salt);
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id || user._id.toString() },
    data: dataToUpdate
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { user: userService.toPublicUser(updatedUser) }, 'Profile updated successfully')
  );
});

// Restart trigger
