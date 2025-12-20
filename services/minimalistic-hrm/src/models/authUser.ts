// models/authUser.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuthUser extends Document {
  companyID: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "hr" | "super_admin";
  contact?: string;
  address?: string;
  dateOfJoin?: Date;
  photoURL?: string;
}

const AuthUserSchema: Schema<IAuthUser> = new Schema(
  {
    name: { type: String, required: true },
    companyID: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "hr", "super_admin"],
      default: "user",
    },
    contact: { type: String },
    address: { type: String },
    dateOfJoin: { type: Date, default: () => new Date() },
    photoURL: { type: String },
  },
  { timestamps: true }
);

// only 1 super_admin in db
AuthUserSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "super_admin" },
  }
);

//  Only ONE admin per company
AuthUserSchema.index(
  { companyID: 1, role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "admin" },
  }
);

export const AuthUserModel: Model<IAuthUser> =
  mongoose.models.AuthUser ||
  mongoose.model<IAuthUser>("AuthUser", AuthUserSchema);

export default AuthUserModel;

