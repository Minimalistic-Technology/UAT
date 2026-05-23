import mongoose from "mongoose";
import { Document } from "mongoose";
import bcrypt from "bcryptjs";
import { GlobalRole } from "./User.model.js";

export interface ITempUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
  otp: string;
  expiresAt: Date;
  isEmployer: boolean;
  companyName?: string;
  companyRole?: string;
  industry?: string;
}

const tempUserSchema = new mongoose.Schema<ITempUser>({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: [GlobalRole.USER, GlobalRole.SUPER_ADMIN],
    default: GlobalRole.USER,
  },
  otp: {
    type: String,
    required: true,
  },
  isEmployer: {
    type: Boolean,
    default: false,
  },
  companyName: {
    type: String,
    trim: true,
  },
  companyRole: {
    type: String,
    trim: true,
  },
  industry: {
    type: String,
    trim: true,
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 600,
  },
});

tempUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

export default mongoose.model<ITempUser>("TempUser", tempUserSchema);
