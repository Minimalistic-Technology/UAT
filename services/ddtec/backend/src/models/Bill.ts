import mongoose, { Schema, Document } from 'mongoose';

export interface IBill extends Document {
    items: Array<{
        name: string;
        price: number;
        quantity: number;
        taxes: Array<{ name: string; rate: number }>;
        fromInventory: boolean;
        productId?: string;
    }>;
    totalAmount: number;
    customerInfo: {
        name: string;
        phone?: string;
        email?: string;
        address?: string;
    };
    globalTax?: {
        rate: number;
        amount: number;
    };
    source: string;
    user?: string;
    createdAt: Date;
}

const BillSchema: Schema = new Schema({
    items: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            taxes: [
                {
                    name: { type: String },
                    rate: { type: Number }
                }
            ],
            fromInventory: { type: Boolean, default: false },
            productId: { type: Schema.Types.ObjectId, ref: 'Product' }
        }
    ],
    totalAmount: { type: Number, required: true },
    customerInfo: {
        name: { type: String, required: true },
        phone: { type: String },
        email: { type: String },
        address: { type: String }
    },
    globalTax: {
        rate: { type: Number },
        amount: { type: Number }
    },
    source: { type: String, default: 'admin_billing' },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model<IBill>('Bill', BillSchema);
