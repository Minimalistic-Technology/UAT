import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
    linkId: mongoose.Types.ObjectId;
    ipAddress?: string;
    device?: string;
    browser?: string;
    accessedAt: Date;
}

const AnalyticsSchema: Schema = new Schema(
    {
        linkId: { type: Schema.Types.ObjectId, ref: 'SharedLink', required: true },
        ipAddress: { type: String },
        device: { type: String },
        browser: { type: String },
    },
    { timestamps: { createdAt: 'accessedAt', updatedAt: false } }
);

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
