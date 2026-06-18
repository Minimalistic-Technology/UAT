import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
    identifier: string;
    otp: string;
    expiresAt: Date;
    attempts: number;
    lockUntil?: number;
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
        index: { expires: '30m' } // Keep the record around a bit longer for lockout tracking
    },
    attempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Number
    }
}, { timestamps: true });

export default mongoose.model<IOTP>('OTP', OTPSchema);
