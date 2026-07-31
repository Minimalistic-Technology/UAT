import mongoose, { Schema, Model, type InferSchemaType } from "mongoose";

export enum OtpPurpose {
  VERIFY_EMAIL = "VERIFY_EMAIL",
  RESET_PASSWORD = "RESET_PASSWORD",
}

const otpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },

    otp: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 8,
    },

    purpose: {
      type: String,
      enum: Object.values(OtpPurpose),
      default: OtpPurpose.VERIFY_EMAIL,
    },

    attempts: {
      type: Number,
      default: 0,
      max: 5, // prevent brute force
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 min
      index: { expires: 0 }, // TTL index
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

export type OtpDocument = InferSchemaType<typeof otpSchema>;
type OtpModel = Model<OtpDocument>;

export const Otp = mongoose.model<OtpDocument, OtpModel>("Otp", otpSchema);
