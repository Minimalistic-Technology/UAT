import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    user: string;
    items: Array<{
        product: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    shippingInfo: {
        fullName: string;
        email: string;
        address: string;
        city: string;
        zip: string;
    };
    paymentMethod: string;
    status: string;
    coupon?: string;
    discountAmount?: number;
    createdAt: Date;
}

const OrderSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    shippingInfo: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        zip: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    coupon: { type: String },
    discountAmount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
