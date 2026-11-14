import mongoose, { Schema, Document } from 'mongoose';

export const INVOICE_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'AUD', 'CAD', 'SGD'] as const;
export type InvoiceCurrency = typeof INVOICE_CURRENCIES[number];

export interface IClient extends Document {
    name: string;
    phone?: string;
    email?: string;
    company?: string;
    gstin?: string;
    currency: InvoiceCurrency;
    note?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ClientSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: {
        type: String,
        trim: true,
        maxlength: 20,
        validate: {
            validator: (v: string) => !v || /^[+]?[\d\s()-]{7,20}$/.test(v),
            message: 'Enter a valid phone number'
        }
    },
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
    company: { type: String, trim: true, maxlength: 100 },
    gstin: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: 15,
        validate: {
            validator: (v: string) => !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v),
            message: 'Enter a valid GSTIN (e.g., 27AAPFU0939F1ZV)'
        }
    },
    currency: { type: String, enum: INVOICE_CURRENCIES, default: 'INR' },
    note: { type: String, maxlength: 2000 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ClientSchema.index({ name: 'text', phone: 'text', email: 'text', company: 'text' });

export default mongoose.model<IClient>('Client', ClientSchema);
