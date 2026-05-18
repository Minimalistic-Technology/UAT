import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'post_deleted' | 'post_approved' | 'post_rejected' | 'general';
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema: Schema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['post_deleted', 'post_approved', 'post_rejected', 'general'],
      default: 'general'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
