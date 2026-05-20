import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string;
    parent?: mongoose.Types.ObjectId;
    description?: string;
    image?: string;
}

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    description: { type: String },
    image: { type: String }
}, { timestamps: true });

export default mongoose.model<ICategory>('Category', CategorySchema);
