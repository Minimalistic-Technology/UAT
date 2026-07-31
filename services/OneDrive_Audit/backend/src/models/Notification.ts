import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    adminId: mongoose.Types.ObjectId;
    employeeName?: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employeeName: { type: String },
    message: { type: String, required: true },
    type: { type: String, enum: ['EXPORT', 'SYSTEM', 'ALERT'], default: 'EXPORT' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

NotificationSchema.index({ adminId: 1, isRead: 1 });

NotificationSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
