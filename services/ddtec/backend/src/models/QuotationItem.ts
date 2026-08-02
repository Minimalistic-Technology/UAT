import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotationItem extends Document {
    name: string;
    price: number;
    hsnCode: string;
    unit: string;
    description: string;
    image: string;
    isActive: boolean;
    product?: mongoose.Types.ObjectId;
    cgst: number;
    sgst: number;
}

const QuotationItemSchema: Schema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    hsnCode: { type: String, default: '' },
    unit: { type: String, default: 'Nos' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    // Optional link to the catalog Product this item was prefilled from.
    // Kept optional/decoupled on purpose: price and other fields here are
    // independently editable and do not stay in sync with the Product.
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    cgst: { type: Number, default: 0, min: 0 },
    sgst: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

export default mongoose.model<IQuotationItem>('QuotationItem', QuotationItemSchema);
