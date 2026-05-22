import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id || (req.user as any)._id.toString();

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

  await prisma.notification.updateMany({
    where: { id: notificationId, recipientId: userId },
    data: { isRead: true }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, 'Notification marked as read')
  );
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id || (req.user as any)._id.toString();

  await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true }
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, 'All notifications marked as read')
  );
});
