import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadStage extends Document {
    name: string;
    color: string;
    order: number;
    isWon: boolean;
    isLost: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const LeadStageSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true, maxlength: 40 },
    color: {
        type: String,
        default: '#3b82f6',
        validate: {
            validator: (v: string) => /^#[0-9a-fA-F]{6}$/.test(v),
            message: 'Color must be a valid hex code'
        }
    },
    order: { type: Number, default: 0, index: true },
    isWon: { type: Boolean, default: false },
    isLost: { type: Boolean, default: false }
}, { timestamps: true });

export const DEFAULT_LEAD_STAGES = [
    { name: 'New', color: '#3b82f6', order: 0, isWon: false, isLost: false },
    { name: 'Contacted', color: '#a855f7', order: 1, isWon: false, isLost: false },
    { name: 'Qualified', color: '#f59e0b', order: 2, isWon: false, isLost: false },
    { name: 'Proposal Sent', color: '#22c55e', order: 3, isWon: false, isLost: false },
    { name: 'Won', color: '#10b981', order: 4, isWon: true, isLost: false },
    { name: 'Lost', color: '#94a3b8', order: 5, isWon: false, isLost: true }
];

export default mongoose.model<ILeadStage>('LeadStage', LeadStageSchema);
