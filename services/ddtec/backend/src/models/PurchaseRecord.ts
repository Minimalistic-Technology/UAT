import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseRecord extends Document {
    product: mongoose.Types.ObjectId | string;
    productName: string;
    seller: string;
    sellerContact?: string;
    quantityAdded: number;
    unitCost: number;
    totalCost: number;
    purchaseDate: Date;
    billScreenshot?: string;
    invoiceNumber?: string;
    notes?: string;
    createdBy?: mongoose.Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}

const PurchaseRecordSchema: Schema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    seller: { type: String, required: true },
    sellerContact: { type: String },
    quantityAdded: { type: Number, required: true },
    unitCost: { type: Number, required: true, default: 0 },
    totalCost: { type: Number, required: true, default: 0 },
    purchaseDate: { type: Date, default: Date.now },
    billScreenshot: { type: String },
    invoiceNumber: { type: String },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model<IPurchaseRecord>('PurchaseRecord', PurchaseRecordSchema);
