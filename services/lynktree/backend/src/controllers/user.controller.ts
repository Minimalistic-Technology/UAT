import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import User from '../models/User.model';

// GET /users/check-username?username=foo
export const checkUsernameAvailability = asyncHandler(async (req: Request, res: Response) => {
  const username = String(req.query.username || '').trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return sendSuccess(res, 200, 'Checked', { available: false, reason: 'invalid_format' });
  }
  const existing = await User.findOne({ username });
  const available = !existing || existing._id.equals(req.user?._id);
  sendSuccess(res, 200, 'Checked', { available });
});

// POST /users/username — one-time username claim after signup
export const setUsername = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.body;

  if (req.user.usernameSet) {
    throw new ApiError(409, 'Username has already been set');
  }

  const existing = await User.findOne({ username });
  if (existing) throw new ApiError(409, 'That username is already taken');

  req.user.username = username;
  req.user.usernameSet = true;
  if (!req.user.displayName) req.user.displayName = username;
  await req.user.save();

  sendSuccess(res, 200, 'Username set successfully', { user: req.user.toPublicJSON() });
});

// PATCH /users/me — update profile (displayName, bio, avatarUrl)
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { displayName, bio, avatarUrl } = req.body;

  if (displayName !== undefined) req.user.displayName = displayName;
  if (bio !== undefined) req.user.bio = bio;
  if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;

  await req.user.save();
  sendSuccess(res, 200, 'Profile updated', { user: req.user.toPublicJSON() });
});
