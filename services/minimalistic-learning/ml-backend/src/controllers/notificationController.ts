import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id || (req.user as any)._id.toString();

  // Auto-prune old notifications to prevent storage accumulation (older than 2 hours)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  await prisma.notification.deleteMany({
    where: {
      recipientId: userId,
      createdAt: { lt: twoHoursAgo }
    }
  });

  const notifications = await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const unreadCount = await prisma.notification.count({
    where: { recipientId: userId, isRead: false }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { notifications, unreadCount }, 'Notifications fetched')
  );
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { notificationId } = req.params;
  const userId = req.user!.id || (req.user as any)._id.toString();

  // Delete notification immediately on read, so it is never permanently stored
  await prisma.notification.deleteMany({
    where: { id: notificationId, recipientId: userId }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, 'Notification seen and deleted')
  );
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id || (req.user as any)._id.toString();

  // Delete all notifications for the user on mark all as read
  await prisma.notification.deleteMany({
    where: { recipientId: userId }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, 'All notifications seen and deleted')
  );
});

export const clearAllNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id || (req.user as any)._id.toString();

  await prisma.notification.deleteMany({
    where: { recipientId: userId }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, 'All notifications deleted successfully')
  );
});
