import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import User from '../models/User.model';
import Link from '../models/Link.model';

// GET /public/:username — public profile + active links, for the /u/[username] page
export const getPublicProfile = asyncHandler(async (req: Request, res: Response) => {
  const username = String(req.params.username || '').trim().toLowerCase();

  const user = await User.findOne({ username, usernameSet: true });
  if (!user) throw new ApiError(404, 'This page does not exist');

  const links = await Link.find({ user: user._id, isActive: true }).sort({ order: 1, createdAt: 1 });

  sendSuccess(res, 200, 'OK', {
    profile: {
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
    },
    links: links.map((l) => ({
      id: l._id,
      type: l.type,
      title: l.title,
      url: l.url,
      thumbnailUrl: l.thumbnailUrl,
    })),
  });
});

// POST /public/:username/links/:linkId/click — fire-and-forget click tracking
export const trackClick = asyncHandler(async (req: Request, res: Response) => {
  await Link.updateOne(
    { _id: req.params.linkId, user: { $exists: true } },
    { $inc: { clickCount: 1 } }
  );
  sendSuccess(res, 200, 'OK');
});
