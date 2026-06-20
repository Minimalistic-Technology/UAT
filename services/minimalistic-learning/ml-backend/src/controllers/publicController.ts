import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { sendNewsletterWelcomeEmail } from '../utils/email';

import CacheService from '../config/redis';

/**
 * GET /api/v1/public/settings
 * Returns only the public-facing feature flags — no auth required.
 * Fully cached to prevent DB spam.
 */
export const getPublicSettings = asyncHandler(async (_req: Request, res: Response) => {
  const cacheKey = 'public:settings';

  // 1. Try Cache First
  const cachedSettings = await CacheService.get(cacheKey);
  if (cachedSettings) {
    return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, JSON.parse(cachedSettings), 'Public settings fetched (Cached)')
    );
  }

  // 2. Cache Miss: Fallback to Database
  const setting = await prisma.siteSetting.findUnique({ where: { key: 'global' } });
  const data = { resourceHubEnabled: setting?.resourceHubEnabled ?? true };

  // 3. Save to Cache for 1 Hour (3600 seconds)
  await CacheService.setex(cacheKey, 3600, JSON.stringify(data));

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, data, 'Public settings fetched')
  );
});

/**
 * POST /api/v1/public/subscribe
 * Newsletter subscription — saves to DB, checks duplicates, and sends a warm welcome email.
 */
export const subscribeNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Please provide a valid email address.');
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingSub = await (prisma as any).subscriber.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingSub) {
    throw new ApiError(StatusCodes.CONFLICT, 'You are already subscribed to our newsletter.');
  }

  await (prisma as any).subscriber.create({
    data: { email: normalizedEmail }
  });

  await sendNewsletterWelcomeEmail(normalizedEmail);

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, {}, 'Thank you for subscribing! Check your inbox 📬')
  );
});

/**
 * GET /api/v1/public/content/:page
 * Gets content blocks for a specific page. Cached for 24 hours.
 */
export const getSiteContent = asyncHandler(async (req: Request, res: Response) => {
  const { page } = req.params;
  const cacheKey = `public:content:${page}`;

  const cached = await CacheService.get(cacheKey);
  if (cached) {
    return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, JSON.parse(cached), 'Page content fetched (Cached)'));
  }

  const content = await (prisma as any).siteContent.findMany({ where: { page } });
  const contentMap = content.reduce((acc: any, curr: any) => {
    try { acc[curr.section] = JSON.parse(curr.content); }
    catch { acc[curr.section] = curr.content; }
    return acc;
  }, {});

  await CacheService.setex(cacheKey, 86400, JSON.stringify(contentMap)); // 24 hours

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, contentMap, 'Page content fetched successfully'));
});

/**
 * GET /api/v1/public/team
 * Get all team members. Cached for 24 hours.
 */
export const getTeamMembers = asyncHandler(async (_req: Request, res: Response) => {
  const cacheKey = `public:team`;

  const cached = await CacheService.get(cacheKey);
  if (cached) {
    return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, JSON.parse(cached), 'Team fetched (Cached)'));
  }

  const team = await (prisma as any).teamMember.findMany({ orderBy: { order: 'asc' } });

  await CacheService.setex(cacheKey, 86400, JSON.stringify(team));

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, team, 'Team members fetched successfully'));
});
