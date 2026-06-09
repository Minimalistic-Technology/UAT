import { Request, Response } from 'express';
import Notification from '../models/Notification';
import mongoose from 'mongoose';

export class NotificationController {
    public getNotifications = async (req: Request, res: Response) => {
        try {
            const user = (req as any).user;
            if (user?.role === 'employee') {
                return res.status(200).json({ notifications: [], unreadCount: 0 }); // Employees don't get notifications
            }

            const userIdString = user?.id;
            const mockUserId = new mongoose.Types.ObjectId("664f33190a424260bd192931");
            const adminId = userIdString ? new mongoose.Types.ObjectId(userIdString as string) : mockUserId;

            const unreadCount = await Notification.countDocuments({ adminId, isRead: false });

            const oneMinuteAgo = new Date(Date.now() - 60000);
            const notifications = await Notification.find({
                adminId,
                $or: [
                    { isRead: false },
                    { isRead: true, updatedAt: { $gte: oneMinuteAgo } }
                ]
            })
                .sort({ createdAt: -1 })
                .limit(50);

            res.status(200).json({ notifications: notifications.map(n => n.toJSON()), unreadCount });
        } catch (error) {
            console.error('Fetch Notifications Error:', error);
            res.status(500).json({ error: 'Failed to fetch notifications' });
        }
    };

    public markAllAsRead = async (req: Request, res: Response) => {
        try {
            const user = (req as any).user;
            if (user?.role === 'employee') return res.status(200).json({ success: true });

            const userIdString = user?.id;
            const mockUserId = new mongoose.Types.ObjectId("664f33190a424260bd192931");
            const adminId = userIdString ? new mongoose.Types.ObjectId(userIdString as string) : mockUserId;

            await Notification.updateMany({ adminId, isRead: false }, { $set: { isRead: true } });
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Mark All Read Error:', error);
            res.status(500).json({ error: 'Failed to update notifications' });
        }
    };

    public markAsRead = async (req: Request, res: Response) => {
        try {
            const notifId = req.params.id;
            const notification = await Notification.findByIdAndUpdate(
                notifId,
                { isRead: true },
                { new: true }
            );

            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            res.status(200).json({ success: true, notification: notification.toJSON() });
        } catch (error) {
            console.error('Mark Read Error:', error);
            res.status(500).json({ error: 'Failed to update notification' });
        }
    };
}
