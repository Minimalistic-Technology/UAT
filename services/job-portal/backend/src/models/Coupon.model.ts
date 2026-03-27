import mongoose, { Document, Schema } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  type: "percentage" | "amount";
  value: number;
  isActive: boolean;
  expiryDate?: Date;
  maxUses?: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ["percentage", "amount"],
      required: [true, "Coupon type is required"],
    },
    value: {
      type: Number,
      required: [true, "Coupon value is required"],
      min: [0, "Value cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
    },
    maxUses: {
      type: Number,
      min: [1, "Max uses must be at least 1"],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICoupon>("Coupon", couponSchema);
