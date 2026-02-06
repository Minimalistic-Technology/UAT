import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    price: number;
    description: string;
    image: string;
    category: string;
    stock: number;
    rating: number;
    numReviews: number;
    lastMonthSales: number;
    brand: string;
    modelName: string;
    couponCode: string;
    discountPercentage: number;
}

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String },
    category: { type: String },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    lastMonthSales: { type: Number, required: true, default: 0 },
    brand: { type: String },
    modelName: { type: String },
    couponCode: { type: String, unique: true, sparse: true },
    discountPercentage: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
