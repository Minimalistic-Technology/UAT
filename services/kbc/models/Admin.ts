import { Schema, model, Document } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  verified: boolean;
  verifyToken?: string;
  verifyTokenExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
  lastLogin?: Date;
}

const adminSchema = new Schema<IAdmin>({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verifyToken: String,
  verifyTokenExpires: Date,
  resetToken: String,
  resetTokenExpires: Date,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
});

export default model<IAdmin>("Admin", adminSchema);
