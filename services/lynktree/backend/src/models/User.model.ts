import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  username?: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  isVerified: boolean;
  usernameSet: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  toPublicJSON(): {
    id: unknown;
    email: string;
    username?: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    isVerified: boolean;
    usernameSet: boolean;
  };
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // allows null until user picks one after signup
      lowercase: true,
      trim: true,
      match: /^[a-z0-9_]{3,20}$/,
    },
    displayName: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, maxlength: 200, default: '' },
    avatarUrl: { type: String, default: '' },

    isVerified: { type: Boolean, default: false },
    usernameSet: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toPublicJSON = function (this: IUser) {
  return {
    id: this._id,
    email: this.email,
    username: this.username,
    displayName: this.displayName,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    isVerified: this.isVerified,
    usernameSet: this.usernameSet,
  };
};

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;
