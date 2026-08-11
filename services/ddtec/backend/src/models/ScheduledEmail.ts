import mongoose, { Schema, Document } from "mongoose";

export interface IScheduledEmail extends Document {
    title: string;
    subject: string;
    recipientType: 'all_users' | 'custom';
    customRecipients?: string[];
    templateId?: string;
    htmlContent: string;
    scheduledAt: Date;
    status: 'pending' | 'sent' | 'failed' | 'cancelled';
    sentAt?: Date;
    sentCount: number;
    failedCount: number;
    errorMessage?: string;
    brevoMessageId?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ScheduledEmailSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    recipientType: {
        type: String,
        enum: ['all_users', 'custom'],
        default: 'all_users',
        required: true
    },
    customRecipients: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    templateId: {
        type: String,
        default: 'custom'
    },
    htmlContent: {
        type: String,
        required: true
    },
    scheduledAt: {
        type: Date,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'cancelled'],
        default: 'pending',
        index: true
    },
    sentAt: {
        type: Date
    },
    sentCount: {
        type: Number,
        default: 0
    },
    failedCount: {
        type: Number,
        default: 0
    },
    errorMessage: {
        type: String
    },
    brevoMessageId: {
        type: String
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

export default mongoose.model<IScheduledEmail>("ScheduledEmail", ScheduledEmailSchema);
