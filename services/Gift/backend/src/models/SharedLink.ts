import mongoose, { Schema, Document } from 'mongoose';

export interface ISharedLink extends Document {
    token: string;
    adminId: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    selectedProducts: mongoose.Types.ObjectId[];
    expiryDate?: Date;
    password?: string;
    isActive: boolean;
    totalViews: number;
    createdAt: Date;
    updatedAt: Date;
}

const SharedLinkSchema: Schema = new Schema(
    {
        token: { type: String, required: true, unique: true },
        adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
        selectedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        expiryDate: { type: Date },
        password: { type: String, select: false },
        isActive: { type: Boolean, default: true },
        totalViews: { type: Number, default: 0 }
    },
    { timestamps: true }
);

SharedLinkSchema.index({ token: 1 });
SharedLinkSchema.index({ adminId: 1 });

export default mongoose.models.SharedLink || mongoose.model<ISharedLink>('SharedLink', SharedLinkSchema);
