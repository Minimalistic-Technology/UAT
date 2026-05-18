import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import Notification from '../models/Notification';

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const notifications = await Notification.find({ recipientId: userId })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({ recipientId: userId, isRead: false });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { notifications, unreadCount }, 'Notifications fetched')
  );
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { notificationId } = req.params;
  const userId = req.user!._id;

  await Notification.findOneAndUpdate(
    { _id: notificationId, recipientId: userId },
    { isRead: true }
  );

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, 'Notification marked as read')
  );
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  await Notification.updateMany(
    { recipientId: userId, isRead: false },
    { isRead: true }
  );

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, null, 'All notifications marked as read')
  );
});
