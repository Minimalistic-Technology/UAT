import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    value: number;
    stage: mongoose.Types.ObjectId;
    source?: string;
    location?: string;
    assignedTo?: mongoose.Types.ObjectId;
    followUpDate?: Date;
    note?: string;
    createdBy?: mongoose.Types.ObjectId;
    convertedClient?: mongoose.Types.ObjectId;
    convertedContact?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const LeadSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    company: { type: String, trim: true, maxlength: 100 },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 254,
        validate: {
            validator: (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            message: 'Enter a valid email address'
        }
    },
    phone: {
        type: String,
        trim: true,
        maxlength: 20,
        validate: {
            validator: (v: string) => !v || /^[+]?[\d\s()-]{7,20}$/.test(v),
            message: 'Enter a valid phone number'
        }
    },
    value: { type: Number, default: 0, min: 0, max: 999999999 },
    stage: { type: Schema.Types.ObjectId, ref: 'LeadStage', required: true, index: true },
    source: { type: String, trim: true, maxlength: 50 },
    location: { type: String, trim: true, maxlength: 150 },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    followUpDate: { type: Date },
    note: { type: String, maxlength: 2000 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    convertedClient: { type: Schema.Types.ObjectId, ref: 'Client', default: null },
    convertedContact: { type: Schema.Types.ObjectId, ref: 'CrmContact', default: null }
}, { timestamps: true });

LeadSchema.index({ name: 'text', company: 'text', email: 'text' });

export default mongoose.model<ILead>('Lead', LeadSchema);
