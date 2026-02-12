import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    price: number;
    description: string;
    image: string;
    images: string[];
    category: mongoose.Types.ObjectId | string; // Allow string for legacy or populated objects
    stock: number;
    rating: number;
    numReviews: number;
    lastMonthSales: number;
    brand: string;
    modelName: string;
    couponCode: string;
    discountPercentage: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    isActive: boolean;
}

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String },
    images: { type: [String], default: [] },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    lastMonthSales: { type: Number, required: true, default: 0 },
    brand: { type: String },
    modelName: { type: String },
    couponCode: { type: String, unique: true, sparse: true },
    discountPercentage: { type: Number, default: 0 }, // Deprecated, use discountValue
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
