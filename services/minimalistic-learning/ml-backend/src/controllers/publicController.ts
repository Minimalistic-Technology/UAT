import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { sendNewsletterWelcomeEmail } from '../utils/email';

/**
 * GET /api/v1/public/settings
 * Returns only the public-facing feature flags — no auth required.
 */
export const getPublicSettings = asyncHandler(async (_req: Request, res: Response) => {
  const setting = await prisma.siteSetting.findUnique({ where: { key: 'global' } });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, {
      resourceHubEnabled: setting?.resourceHubEnabled ?? true,
    }, 'Public settings fetched')
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
 * Gets content blocks for a specific page
 */
export const getSiteContent = asyncHandler(async (req: Request, res: Response) => {
  const { page } = req.params;
  const content = await (prisma as any).siteContent.findMany({
    where: { page }
  });

  const contentMap = content.reduce((acc: any, curr: any) => {
    try {
      acc[curr.section] = JSON.parse(curr.content);
    } catch {
      acc[curr.section] = curr.content;
    }
    return acc;
  }, {});

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, contentMap, 'Page content fetched successfully')
  );
});

/**
 * GET /api/v1/public/team
 * Get all team members
 */
export const getTeamMembers = asyncHandler(async (_req: Request, res: Response) => {
  const team = await (prisma as any).teamMember.findMany({
    orderBy: { order: 'asc' }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, team, 'Team members fetched successfully')
  );
});
