import mongoose, { Schema, Document } from 'mongoose';

export interface IHub extends Document {
    name: string;      // e.g., "Mumbai Central Dark Store"
    code: string;      // e.g., "MUM-01"
    address: string;
    city: string;
    pincodes: string[]; // List of postal codes this hub delivers to
    isActive: boolean;
    contactPhone?: string;
    contactEmail?: string;
}

const HubSchema: Schema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincodes: { type: [String], required: true, default: [] },
    isActive: { type: Boolean, default: true },
    contactPhone: { type: String },
    contactEmail: { type: String }
}, { timestamps: true });

export default mongoose.model<IHub>('Hub', HubSchema);
