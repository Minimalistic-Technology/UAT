import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
    name: string;
    location?: string;
    gstNumber?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CompanySchema: Schema = new Schema({
    name: { type: String, required: true, trim: true, maxlength: 150 },
    location: { type: String, trim: true, maxlength: 200 },
    gstNumber: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: 15,
        validate: {
            validator: (v: string) => !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v),
            message: 'Enter a valid GST number (e.g., 27AAPFU0939F1ZV)'
        }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

CompanySchema.index({ name: 'text', location: 'text', gstNumber: 'text' });

export default mongoose.model<ICompany>('Company', CompanySchema);
