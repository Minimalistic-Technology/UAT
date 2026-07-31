import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    sharedLinkId: mongoose.Types.ObjectId;
    employeeName: string;
    employeeEmail: string;
    employeeId: string;
    address: string;
    notes?: string;
    selectedProducts: mongoose.Types.ObjectId[];
    status: 'Pending' | 'Approved' | 'Shipped' | 'Rejected' | 'Cancelled';
    submittedBy: mongoose.Types.ObjectId;
    hrId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
    {
        sharedLinkId: { type: Schema.Types.ObjectId, ref: 'SharedLink', required: true },
        employeeName: { type: String, required: true },
        employeeEmail: { type: String, required: true },
        employeeId: { type: String, required: true },
        address: { type: String, required: true },
        notes: { type: String },
        selectedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product', required: true }],
        status: { type: String, enum: ['Pending', 'Approved', 'Shipped', 'Rejected', 'Cancelled'], default: 'Pending' },
        submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        hrId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
