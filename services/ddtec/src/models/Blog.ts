import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
    title: string;
    content: string;
    author: string;
    image: string;
    slug: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const BlogSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: String },
    slug: { type: String, required: true, unique: true },
    tags: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model<IBlog>('Blog', BlogSchema);
