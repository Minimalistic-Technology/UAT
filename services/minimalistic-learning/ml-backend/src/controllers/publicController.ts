import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import SiteSetting from '../models/SiteSetting';
import { sendNewsletterWelcomeEmail } from '../utils/email';

/**
 * GET /api/v1/public/settings
 * Returns only the public-facing feature flags — no auth required.
 */
export const getPublicSettings = asyncHandler(async (_req: Request, res: Response) => {
  const setting = await SiteSetting.findOne({ key: 'global' });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, {
      resourceHubEnabled: setting?.resourceHubEnabled ?? true,
    }, 'Public settings fetched')
  );
});

/**
 * POST /api/v1/public/subscribe
 * Newsletter subscription — sends a warm welcome email.
 */
export const subscribeNewsletter = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Please provide a valid email address.');
  }

  await sendNewsletterWelcomeEmail(email.toLowerCase().trim());

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, {}, 'Thank you for subscribing! Check your inbox 📬')
  );
});

