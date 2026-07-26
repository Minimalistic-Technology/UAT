import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotationItem extends Document {
    name: string;
    price: number;
    hsnCode: string;
    unit: string;
    description: string;
    isActive: boolean;
}

const QuotationItemSchema: Schema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    hsnCode: { type: String, default: '' },
    unit: { type: String, default: 'Nos' },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IQuotationItem>('QuotationItem', QuotationItemSchema);
