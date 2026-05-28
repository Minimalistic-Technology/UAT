import { Schema, model, Document } from 'mongoose';

export interface IActivityLog extends Document {
    userEmail: string;
    action: string;
    details?: Record<string, any>;
    createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
    {
        userEmail: { type: String, required: true },
        action: { type: String, required: true },
        details: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

// We export the model only if mongoose connects successfully, but it's safe to define here.
export const ActivityLog = model<IActivityLog>('ActivityLog', ActivityLogSchema);
