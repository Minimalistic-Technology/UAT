import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { MAX_SESSIONS } from "../constants";
import crypto from "crypto";

export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

interface ISession {
  refreshToken: string;
  deviceInfo?: string;
  createdAt: Date;
  lastUsedAt: Date;
}

interface IUser {
  email: string;
  password: string;
  sessions: ISession[];
  isVerified: boolean;
}

interface IUserMethods {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(deviceInfo?: string): string;
  addSession(refreshToken: string, deviceInfo?: string): Promise<void>;
  removeSession(refreshToken: string): Promise<void>;
  removeAllSessions(): Promise<void>;
}

type UserDocument = Document & IUser & IUserMethods;
type UserModel = Model<UserDocument>;

const sessionSchema = new Schema<ISession>(
  {
    refreshToken: { type: String, required: true },
    deviceInfo: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new Schema<UserDocument, UserModel>(
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
      required: [true, "Password is required"],
    },
    sessions: {
      type: [sessionSchema],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  const user = this as UserDocument;

  if (!user.isModified("password")) return next;

  user.password = await bcrypt.hash(user.password, 10);
  next;
});

userSchema.methods.isPasswordCorrect = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign(
    { _id: this._id.toString(), email: this.email },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"] },
  );
};

userSchema.methods.generateRefreshToken = function (
  deviceInfo?: string,
): string {
  const token = jwt.sign(
    { _id: this._id.toString() },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"] },
  );

  const hashedToken = hashToken(token);
  const now = new Date();

  if (this.sessions.length >= MAX_SESSIONS) {
    this.sessions.sort(
      (a: ISession, b: ISession) =>
        a.lastUsedAt.getTime() - b.lastUsedAt.getTime(),
    );

    // Remove the one that hasn't been used for the longest time
    this.sessions.shift();
  }

  const newSession: ISession = {
    refreshToken: hashedToken,
    deviceInfo,
    createdAt: now,
    lastUsedAt: now,
  };

  this.sessions.push(newSession);

  return token;
};

userSchema.methods.removeSession = async function (
  refreshToken: string,
): Promise<void> {
  this.sessions = this.sessions.filter(
    (s: ISession) => s.refreshToken !== refreshToken,
  );
  await this.save();
};

userSchema.methods.removeAllSessions = async function (): Promise<void> {
  this.sessions = [];
  await this.save();
};

export const User = mongoose.model<UserDocument, UserModel>("User", userSchema);
