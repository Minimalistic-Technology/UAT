import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue: number;
    type: 'product' | 'cart' | 'shipping';
    applicableProducts: mongoose.Types.ObjectId[];
    usageLimit: number;
    usedCount: number;
    expiresAt: Date;
    isActive: boolean;
}

const CouponSchema: Schema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    type: { type: String, enum: ['product', 'cart', 'shipping'], required: true, default: 'cart' },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    usageLimit: { type: Number, default: null }, // Null means unlimited
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
