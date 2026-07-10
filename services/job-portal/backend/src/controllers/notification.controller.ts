import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { prisma } from "../lib/prisma.js";
import { User } from "../../generated/prisma/client.js";

interface CustomRequest extends Request {
  user?: any;
}

// Utility to check if notifications are globally enabled via feature flag
const checkNotificationFeature = async (user?: any): Promise<boolean> => {
  const feature = await prisma.feature.findUnique({
    where: { slug: "notification-system" },
  });
  if (!feature || feature.status === "DISABLED") return false;
  if (feature.status === "PUBLIC") return true;
  if (feature.status === "BETA") {
    if (!user) return false;
    const orConditions: any[] = [{ userId: user.id }];
    if (user.companyId) orConditions.push({ companyId: user.companyId });

    const permission = await prisma.featurePermission.findFirst({
      where: {
        featureId: feature.id,
        OR: orConditions,
      },
    });
    return !!permission;
  }
  return false;
};

export const requireNotificationFeature = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const isFeatureEnabled = await checkNotificationFeature(req.user);
    if (!isFeatureEnabled) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            null,
            "Notification feature is currently disabled",
          ),
        );
    }
    next();
  } catch (error) {
    next(error);
  }
};

// 1. Get Notifications
export const getNotifications = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const notifications = await prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      take: 50, // Ensure efficiency without too much load
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          notifications,
          "Notifications fetched successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

// 2. Mark as Read
export const markAsRead = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const notificationId = req.params.notificationId as string;
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, recipientId: userId },
    });

    if (!notification) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Notification not found"));
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, updatedNotification, "Marked as read"));
  } catch (error) {
    next(error);
  }
};

// 3. Mark All as Read
export const markAllAsRead = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    await prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "All notifications marked as read"));
  } catch (error) {
    next(error);
  }
};

// 4. Toggle Notification Preference (Block / Unblock)
export const toggleBlockNotifications = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const { isBlocked } = req.body;

    if (typeof isBlocked !== "boolean") {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "isBlocked boolean value is required"),
        );
    }

    const preference = await prisma.notificationPreference.upsert({
      where: { userId },
      update: { isBlocked },
      create: { userId, isBlocked },
    });

    const message = isBlocked
      ? "Notifications blocked"
      : "Notifications unblocked";
    return res.status(200).json(new ApiResponse(200, preference, message));
  } catch (error) {
    next(error);
  }
};

// 5. Get Notification Preference
export const getNotificationPreference = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const preference = await prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: { userId, isBlocked: false },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, preference, "Notification preference fetched"),
      );
  } catch (error) {
    next(error);
  }
};
