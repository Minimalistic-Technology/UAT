
import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
    product: mongoose.Schema.Types.ObjectId;
    quantity: number;
}

export interface ICart extends Document {
    user: mongoose.Schema.Types.ObjectId;
    items: ICartItem[];
}

const CartSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            }
        }
    ]
}, { timestamps: true });

export default mongoose.model<ICart>('Cart', CartSchema);
