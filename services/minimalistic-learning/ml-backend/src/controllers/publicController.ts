import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { sendNewsletterWelcomeEmail } from '../utils/email';

import CacheService from '../config/redis';

export const getSystemStatus = asyncHandler(async (_req: Request, res: Response) => {
  const cacheKey = 'public:status';

  const cachedStatus = await CacheService.get(cacheKey);
  if (cachedStatus) {
    return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, JSON.parse(cachedStatus), 'System status (Cached)'));
  }

  const setting = await prisma.siteSetting.findUnique({ where: { key: 'global' }, select: { maintenanceMode: true } });
  const data = { maintenanceMode: setting?.maintenanceMode ?? false };

  await CacheService.setex(cacheKey, 1800, JSON.stringify(data)); // Increased to 30 mins for robust testing

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, data, 'System status'));
});


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

  // ====== DYNAMIC METRICS INJECTION ======
  if (page === 'home') {
    if (!contentMap.hero) contentMap.hero = {};

    // Parallel processing for extreme speed
    const [usersCount, postsCount, subCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      (prisma as any).subscriber.count()
    ]);

    // Override static fallback content with REAL database values
    contentMap.hero.c1Stat = `${postsCount}+`;
    contentMap.hero.c1StatLabel = 'Premium Posts';

    contentMap.hero.c2Stat = `${subCount}+`;
    contentMap.hero.c2StatLabel = 'Newsletter Readers';

    contentMap.hero.c3Stat = `${usersCount}+`;
    contentMap.hero.c3StatLabel = 'Active Members';
  } else if (page === 'about') {
    // Dynamic Stats for About Page
    const [usersCount, postsCount, teamCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      (prisma as any).teamMember.count()
    ]);

    contentMap.dynamicStats = [
      { value: usersCount || 1, suffix: "+", label: "Active Learners" },
      { value: 98, suffix: "%", label: "Completion Rate" },
      { value: postsCount || 1, suffix: "+", label: "Curated Guides" },
      { value: teamCount || 1, suffix: "+", label: "Expert Authors" }
    ];
  }
  // =======================================

  await CacheService.setex(cacheKey, 86400, JSON.stringify(contentMap)); // 24 hours

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, contentMap, 'Page content fetched successfully'));
});


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
