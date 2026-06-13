import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationPreference extends Document {
    user: mongoose.Types.ObjectId;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema);
