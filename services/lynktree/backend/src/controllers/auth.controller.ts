import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import User from '../models/User.model';
import Otp, { OtpPurpose } from '../models/Otp.model';
import RefreshToken from '../models/RefreshToken.model';
import { generateOtpCode } from '../utils/otp';
import { sendOtpEmail } from '../utils/email';
import { env } from '../config/env';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from '../utils/tokens';
import type { IUser } from '../models/User.model';

const OTP_MAX_ATTEMPTS = 5;

async function issueOtp(email: string, purpose: OtpPurpose) {
  const code = generateOtpCode();
  const codeHash = await Otp.hashCode(code);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60 * 1000);

  await Otp.deleteMany({ email, purpose, consumed: false });
  await Otp.create({ email, codeHash, purpose, expiresAt });
  await sendOtpEmail(email, code, purpose);
}

async function issueSession(res: Response, user: IUser, req: Request): Promise<string> {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip,
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return accessToken;
}

// POST /auth/signup
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing && existing.isVerified) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = existing || new User({ email, password });
  if (existing) {
    // Re-signing up an unverified account: refresh the password in case they forgot it.
    existing.password = password;
  }
  await user.save();

  await issueOtp(email, 'signup');

  sendSuccess(res, 201, 'Account created. Check your email for a verification code.', {
    email: user.email,
  });
});

// POST /auth/verify-otp
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, code, purpose = 'signup' } = req.body;

  const otp = await Otp.findOne({ email, purpose, consumed: false }).sort({ createdAt: -1 });
  if (!otp) throw new ApiError(400, 'No pending verification for this email. Request a new code.');

  if (otp.expiresAt < new Date()) {
    throw new ApiError(400, 'This code has expired. Request a new one.');
  }
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    throw new ApiError(429, 'Too many incorrect attempts. Request a new code.');
  }

  const isMatch = await otp.compareCode(code);
  if (!isMatch) {
    otp.attempts += 1;
    await otp.save();
    throw new ApiError(400, 'Incorrect code');
  }

  otp.consumed = true;
  await otp.save();

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'User not found');

  if (purpose === 'signup') {
    user.isVerified = true;
    await user.save();
  }

  const accessToken = await issueSession(res, user, req);

  sendSuccess(res, 200, 'Verified successfully', {
    accessToken,
    user: user.toPublicJSON(),
  });
});

// POST /auth/resend-otp
export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, purpose = 'signup' } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'No account found for this email');
  if (purpose === 'signup' && user.isVerified) {
    throw new ApiError(409, 'This account is already verified');
  }

  await issueOtp(email, purpose);
  sendSuccess(res, 200, 'A new code has been sent to your email');
});

// POST /auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  if (!user.isVerified) {
    await issueOtp(email, 'signup');
    throw new ApiError(403, 'Email not verified. We sent a new verification code.');
  }

  const accessToken = await issueSession(res, user, req);
  sendSuccess(res, 200, 'Logged in successfully', {
    accessToken,
    user: user.toPublicJSON(),
  });
});

// POST /auth/refresh
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) throw new ApiError(401, 'No refresh token provided');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const tokenHash = hashToken(token);
  const stored = await RefreshToken.findOne({ tokenHash, user: payload.sub });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new ApiError(401, 'Refresh token is no longer valid');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'User no longer exists');

  // Rotate: revoke old token, issue a new pair
  stored.revoked = true;

  const newRefreshToken = signRefreshToken(user);
  stored.replacedByHash = hashToken(newRefreshToken);
  await stored.save();

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip,
  });

  res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions());

  const accessToken = signAccessToken(user);
  sendSuccess(res, 200, 'Token refreshed', { accessToken, user: user.toPublicJSON() });
});

// POST /auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    const tokenHash = hashToken(token);
    await RefreshToken.updateOne({ tokenHash }, { revoked: true });
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  sendSuccess(res, 200, 'Logged out');
});

// POST /auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // Always respond success to avoid leaking which emails are registered.
  if (user) {
    await issueOtp(email, 'reset_password');
  }
  sendSuccess(res, 200, 'If that email is registered, a reset code has been sent');
});

// POST /auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, code, password } = req.body;

  const otp = await Otp.findOne({ email, purpose: 'reset_password', consumed: false }).sort({
    createdAt: -1,
  });
  if (!otp) throw new ApiError(400, 'No pending reset request for this email');
  if (otp.expiresAt < new Date()) throw new ApiError(400, 'This code has expired');
  if (otp.attempts >= OTP_MAX_ATTEMPTS) throw new ApiError(429, 'Too many incorrect attempts');

  const isMatch = await otp.compareCode(code);
  if (!isMatch) {
    otp.attempts += 1;
    await otp.save();
    throw new ApiError(400, 'Incorrect code');
  }
  otp.consumed = true;
  await otp.save();

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'User not found');

  user.password = password;
  await user.save();

  await RefreshToken.updateMany({ user: user._id, revoked: false }, { revoked: true });

  sendSuccess(res, 200, 'Password reset successfully. Please log in.');
});

// GET /auth/me
export const me = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 200, 'OK', { user: req.user.toPublicJSON() });
});
