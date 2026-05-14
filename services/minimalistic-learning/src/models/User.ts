import mongoose, { Schema, HydratedDocument, Model } from "mongoose";
import bcrypt from "bcrypt";
import { isValidPhoneNumber } from "libphonenumber-js";

export interface IUser {
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;
export type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (val: string) => isValidPhoneNumber(val),
        message: "Invalid phone number",
      },
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.set("toJSON", {
  transform(_doc, ret) {
    const { password, otp, otpExpires, __v, ...safe } = ret;
    return safe;
  },
});

userSchema.pre<UserDocument>("save", async function () {
  if (!this.isModified("password")) return;
  
  // Prevent double-hashing if the password is already a bcrypt hash
  // (e.g., when transferred from PendingUser)
  if (this.password && this.password.startsWith('$2b$')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (
  this: UserDocument,
  candidate: string,
) {
  return bcrypt.compare(candidate, this.password);
};

const User =
  mongoose.models.User || mongoose.model<IUser, UserModel>("User", userSchema);
export default User;
