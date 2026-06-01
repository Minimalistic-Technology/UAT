import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    microsoftId: string;
    email: string;
    name: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiresAt: Date;
}

const UserSchema = new Schema<IUser>({
    microsoftId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    tokenExpiresAt: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
