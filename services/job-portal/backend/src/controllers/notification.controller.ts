import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import Notification from "../models/Notification.model.js";
import NotificationPreference from "../models/NotificationPreference.model.js";
import Feature, { FeatureStatus } from "../models/Feature.model.js";
import FeaturePermission from "../models/FeaturePermission.model.js";
import { IUser } from "../models/User.model.js";

interface CustomRequest extends Request {
    user?: IUser;
}

// Utility to check if notifications are globally enabled via feature flag
const checkNotificationFeature = async (user?: IUser): Promise<boolean> => {
    const feature = await Feature.findOne({ slug: "notification-system" });
    if (!feature || feature.status === FeatureStatus.DISABLED) return false;
    if (feature.status === FeatureStatus.PUBLIC) return true;
    if (feature.status === FeatureStatus.BETA) {
        if (!user) return false;
        const query: any = { feature: feature._id };
        const orConditions: any[] = [{ user: user._id }];
        if (user.company) orConditions.push({ company: user.company });
        query.$or = orConditions;
        const permission = await FeaturePermission.findOne(query);
        return !!permission;
    }
    return false;
}

export const requireNotificationFeature = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
        const isFeatureEnabled = await checkNotificationFeature(req.user);
        if (!isFeatureEnabled) {
            return res.status(403).json(new ApiResponse(403, null, "Notification feature is currently disabled"));
        }
        next();
    } catch (error) {
        next(error);
    }
};

// 1. Get Notifications
export const getNotifications = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {

        const userId = req.user?._id;
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(50); // Ensure efficiency without too much load

        return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
    } catch (error) {
        next(error);
    }
};

// 2. Mark as Read
export const markAsRead = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {

        const { notificationId } = req.params;
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: req.user?._id },
            { isRead: true },
            { returnDocument: "after" }
        );

        if (!notification) {
            return res.status(404).json(new ApiResponse(404, null, "Notification not found"));
        }

        return res.status(200).json(new ApiResponse(200, notification, "Marked as read"));
    } catch (error) {
        next(error);
    }
};

// 3. Mark All as Read
export const markAllAsRead = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {

        await Notification.updateMany(
            { recipient: req.user?._id, isRead: false },
            { isRead: true }
        );

        return res.status(200).json(new ApiResponse(200, null, "All notifications marked as read"));
    } catch (error) {
        next(error);
    }
};

// 4. Toggle Notification Preference (Block / Unblock)
export const toggleBlockNotifications = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {

        const userId = req.user?._id;
        const { isBlocked } = req.body;

        if (typeof isBlocked !== 'boolean') {
            return res.status(400).json(new ApiResponse(400, null, "isBlocked boolean value is required"));
        }

        let preference = await NotificationPreference.findOne({ user: userId });
        if (!preference) {
            preference = await NotificationPreference.create({ user: userId, isBlocked });
        } else {
            preference.isBlocked = isBlocked;
            await preference.save();
        }

        const message = isBlocked ? "Notifications blocked" : "Notifications unblocked";
        return res.status(200).json(new ApiResponse(200, preference, message));
    } catch (error) {
        next(error);
    }
};

// 5. Get Notification Preference
export const getNotificationPreference = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {

        const userId = req.user?._id;
        let preference = await NotificationPreference.findOne({ user: userId });
        if (!preference) {
            preference = await NotificationPreference.create({ user: userId, isBlocked: false });
        }

        return res.status(200).json(new ApiResponse(200, preference, "Notification preference fetched"));
    } catch (error) {
        next(error);
    }
};
