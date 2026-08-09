import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedQuotationItem {
    itemId?: string;
    name: string;
    price: number;
    unit: string;
    quantity: number;
    cgst: number;
    sgst: number;
    hsnCode?: string;
}

export interface ISavedQuotation extends Document {
    title?: string;
    user?: mongoose.Types.ObjectId;
    quotationNumber: string;
    buyer: {
        name: string;
        address?: string;
        gstin?: string;
        stateName?: string;
    };
    items: ISavedQuotationItem[];
    subtotal: number;
    cgstAmount: number;
    sgstAmount: number;
    grandTotal: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SavedQuotationSchema: Schema = new Schema({
    title: { type: String, trim: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    quotationNumber: { type: String, required: true },
    buyer: {
        name: { type: String, required: true },
        address: { type: String, default: '' },
        gstin: { type: String, default: '' },
        stateName: { type: String, default: '' }
    },
    items: [
        {
            itemId: { type: String },
            name: { type: String, required: true },
            price: { type: Number, required: true, min: 0 },
            unit: { type: String, default: 'Nos' },
            quantity: { type: Number, required: true, min: 1 },
            cgst: { type: Number, default: 0 },
            sgst: { type: Number, default: 0 },
            hsnCode: { type: String, default: '' }
        }
    ],
    subtotal: { type: Number, required: true, min: 0 },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model<ISavedQuotation>('SavedQuotation', SavedQuotationSchema);
