import mongoose, { Schema, Document } from 'mongoose';


export interface IOrder extends Document {
    user?: string; // Optional for Guest
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
    shippingFee?: number;
    shippingCarrier?: string;
    shippingServiceName?: string;
    shippingCarrierId?: string;
    totalWeightKg?: number;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    cashfree?: {
        orderId?: string;
        paymentSessionId?: string;
        cfOrderId?: string;
        cfPaymentId?: string;
        lastEvent?: string;
    };
    createdAt: Date;
}

const OrderSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' }, // Not required for guest
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
    discountAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    shippingCarrier: { type: String, default: 'Blue Dart Express' },
    shippingServiceName: { type: String },
    shippingCarrierId: { type: String },
    totalWeightKg: { type: Number, default: 1.0 },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    cashfree: {
        orderId: { type: String },
        paymentSessionId: { type: String },
        cfOrderId: { type: String },
        cfPaymentId: { type: String },
        lastEvent: { type: String }
    }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
