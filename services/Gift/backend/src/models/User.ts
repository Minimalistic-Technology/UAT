import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'Admin' | 'HRAdmin' | 'User';
    avatar?: string;
    isVerified: boolean;
    otp?: string;
    otpExpiry?: Date;
    refreshToken?: string;
    loginAttempts: number;
    lockUntil?: Date;
    otpAttempts: number;
    otpLockUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, select: false },
        role: { type: String, enum: ['Admin', 'HRAdmin', 'User'], default: 'User' },
        avatar: { type: String },
        isVerified: { type: Boolean, default: false },
        otp: { type: String, select: false },
        otpExpiry: { type: Date, select: false },
        refreshToken: { type: String, select: false },
        loginAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date },
        otpAttempts: { type: Number, default: 0 },
        otpLockUntil: { type: Date }
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
