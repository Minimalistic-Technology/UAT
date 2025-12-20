import mongoose, { Document, Schema } from "mongoose";

export interface IRegisteredUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
}

const registeredUserSchema = new Schema<IRegisteredUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
  },
  { timestamps: true }
);

const RegisteredUser = mongoose.model<IRegisteredUser>("RegisteredUser", registeredUserSchema);
export default RegisteredUser;
