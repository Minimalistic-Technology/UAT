import mongoose, { Schema, Document } from 'mongoose';


export interface IOrder extends Document {
    user?: string; // Optional for Guest
    items: Array<{
        product: string;
        quantity: number;
        price: number;
        assignedHubId?: mongoose.Types.ObjectId | string;
        itemStatus?: string;
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
    user: { type: Schema.Types.ObjectId, ref: 'User' }, // Not required for guest
    items: [
        {
            product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            assignedHubId: { type: Schema.Types.ObjectId, ref: 'Hub' },
            itemStatus: { type: String, enum: ['pending', 'packed', 'shipped', 'delivered', 'cancelled'], default: 'pending' }
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
