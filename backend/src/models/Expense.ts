import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
    title: string;
    description?: string;
    amount: number;
    category: string;
    date: Date;
    receiptUrl?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    receiptUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IExpense>("Expense", ExpenseSchema);
