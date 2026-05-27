import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    title: string;
    slug: string;
    description: string;
    images: string[];
    thumbnail: string;
    category: string;
    price: number;
    discountPrice?: number;
    stock: number;
    sku: string;
    brand: string;
    ratings: number;
    tags: string[];
    status: 'Active' | 'Draft' | 'Archived';
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        images: [{ type: String }],
        thumbnail: { type: String },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        stock: { type: Number, required: true, default: 0 },
        sku: { type: String, required: true },
        brand: { type: String },
        ratings: { type: Number, default: 0 },
        tags: [{ type: String }],
        status: { type: String, enum: ['Active', 'Draft', 'Archived'], default: 'Active' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

ProductSchema.index({ category: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
