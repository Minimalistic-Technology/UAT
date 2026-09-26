import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  googleId: string;
  email: string;
  name?: string;
  image?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: String,
    image: String,
    refreshToken: String,
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
