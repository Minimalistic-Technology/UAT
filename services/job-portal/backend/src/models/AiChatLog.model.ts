import mongoose, { Schema, Document } from 'mongoose';

export interface IAiChatLog extends Document {
    user: mongoose.Types.ObjectId;
    prompt: string;
    response: string;
}

const aiChatLogSchema = new Schema<IAiChatLog>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        prompt: {
            type: String,
            required: true
        },
        response: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

// Indexes for fast reading
aiChatLogSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IAiChatLog>('AiChatLog', aiChatLogSchema);
