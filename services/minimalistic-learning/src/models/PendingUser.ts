import mongoose, { Schema, Document } from 'mongoose';

export interface IPendingUser extends Document {
  firstName: string;
  lastName?: string;
  email: string;
  password?: string; // Hashed password
  contactNumber?: string;
  otp: string;
  otpExpires: Date;
  createdAt: Date;
}

const PendingUserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  contactNumber: { type: String },
  otp: { type: String, required: true },
  otpExpires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 mins
});

export default mongoose.model<IPendingUser>('PendingUser', PendingUserSchema);
