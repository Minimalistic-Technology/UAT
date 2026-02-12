import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
    identifier: string;
    otp: string;
    expiresAt: Date;
}

const OTPSchema: Schema = new Schema({
    identifier: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: Date.now,
        index: { expires: '5m' } // Auto-delete after 5 minutes (TTL)
    }
}, { timestamps: true });

export default mongoose.model<IOTP>('OTP', OTPSchema);
