import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    microsoftId?: string; // Optional for employees
    email: string;
    name: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;

    // RBAC System
    password?: string; // Hashed password for employees
    role: 'admin' | 'employee';
    adminId?: mongoose.Types.ObjectId; // Link employee to specific admin
}

const UserSchema = new Schema<IUser>({
    microsoftId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },

    // Auth Tokens
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenExpiresAt: { type: Date },

    // Role Based Access
    password: { type: String, select: false },
    role: { type: String, enum: ['admin', 'employee'], default: 'admin' },
    adminId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
