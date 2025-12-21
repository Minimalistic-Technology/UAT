import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IRegisteredUser extends Document {
  firstName: string;
  lastName: string;
  userName:String;
  email: string;
  phone: string;
  age: number;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const registeredUserSchema = new Schema<IRegisteredUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName:{ type: String, required: true , unique: true},
    email: { type: String,  unique: true },
    phone: { type: String },
    age: { type: Number, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

registeredUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

registeredUserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const RegisteredUser = mongoose.model<IRegisteredUser>("RegisteredUser", registeredUserSchema);

export default RegisteredUser;
