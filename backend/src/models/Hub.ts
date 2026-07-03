import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IHub extends Document {
    name: string;      // e.g., "Mumbai Central Dark Store"
    code: string;      // e.g., "MUM-01"
    address: string;
    city: string;
    pincodes: string[]; // List of postal codes this hub delivers to
    isActive: boolean;
    contactPhone?: string;
    contactEmail?: string; // used as Login ID
    password?: string;
}

const HubSchema: Schema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincodes: { type: [String], required: true, default: [] },
    isActive: { type: Boolean, default: true },
    contactPhone: { type: String },
    contactEmail: { type: String, unique: true, sparse: true },
    password: { type: String }
}, { timestamps: true });

HubSchema.pre("save", async function (this: IHub) {
    if (!this.isModified("password")) return;
    if (this.password && typeof this.password === "string") {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

export default mongoose.model<IHub>('Hub', HubSchema);
