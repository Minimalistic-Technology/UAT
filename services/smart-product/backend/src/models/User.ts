import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'Admin' | 'User';
    avatar?: string;
    isVerified: boolean;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, select: false },
        role: { type: String, enum: ['Admin', 'User'], default: 'User' },
        avatar: { type: String },
        isVerified: { type: Boolean, default: false },
        refreshToken: { type: String, select: false }
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
