import mongoose, { Schema, Document } from 'mongoose';

export type ClientProjectStatus = 'ongoing' | 'completed';

export interface IClientProject extends Document {
    client: mongoose.Types.ObjectId;
    title: string;
    status: ClientProjectStatus;
    note?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ClientProjectSchema: Schema = new Schema({
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
    note: { type: String, maxlength: 2000 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model<IClientProject>('ClientProject', ClientProjectSchema);
