import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type OtpPurpose = 'signup' | 'login' | 'reset_password';

export interface IOtp extends Document {
  email: string;
  codeHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  attempts: number;
  consumed: boolean;
  createdAt: Date;
  compareCode(candidate: string): Promise<boolean>;
}

interface IOtpModel extends Model<IOtp> {
  hashCode(code: string): Promise<string>;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    codeHash: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['signup', 'login', 'reset_password'],
      default: 'signup',
    },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    consumed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Mongo TTL index — auto-delete stale OTP documents an hour after expiry
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

OtpSchema.statics.hashCode = function (code: string) {
  return bcrypt.hash(code, 10);
};

OtpSchema.methods.compareCode = function (this: IOtp, candidate: string) {
  return bcrypt.compare(candidate, this.codeHash);
};

const Otp = mongoose.model<IOtp, IOtpModel>('Otp', OtpSchema);
export default Otp;
