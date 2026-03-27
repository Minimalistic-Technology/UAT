import { Schema, model, Document } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  role: "admin" | "questioner";
  name?: string;
  verified: boolean;
  verifyToken?: string;
  verifyTokenExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
  lastLogin?: Date;
  currentSessionId?: string;
}

const adminSchema = new Schema<IAdmin>({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "questioner"], default: "admin" },
  name: { type: String },
  verified: { type: Boolean, default: false },
  verifyToken: String,
  verifyTokenExpires: Date,
  resetToken: String,
  resetTokenExpires: Date,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  currentSessionId: { type: String },
});

export default model<IAdmin>("Admin", adminSchema);
