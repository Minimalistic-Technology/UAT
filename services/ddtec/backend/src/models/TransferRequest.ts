import mongoose, { Schema, Document } from 'mongoose';

export interface ITransferRequest extends Document {
    product: mongoose.Types.ObjectId;
    productName: string;
    fromWarehouse: string; // The warehouse supplying the stock
    toWarehouse: string;   // The warehouse requesting the stock
    quantity: number;
    status: 'pending' | 'approved' | 'in_transit' | 'completed' | 'rejected';
    notes?: string;
    completedAt?: Date;
}

const TransferRequestSchema: Schema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    fromWarehouse: { type: String, required: true },
    toWarehouse: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'in_transit', 'completed', 'rejected'], default: 'pending' },
    notes: { type: String },
    completedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<ITransferRequest>('TransferRequest', TransferRequestSchema);
