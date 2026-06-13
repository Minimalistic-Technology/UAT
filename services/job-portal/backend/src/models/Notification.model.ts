import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationType {
    SYSTEM = "system",
    MESSAGE = "message",
    ALERT = "alert",
    PROMOTIONAL = "promotional"
}

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    sender?: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    actionUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: Object.values(NotificationType), default: NotificationType.SYSTEM },
    isRead: { type: Boolean, default: false },
    actionUrl: { type: String }
}, { timestamps: true });

// Ensure clean and fast queries without duplicate codes
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
