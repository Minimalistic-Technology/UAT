import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  type: "percentage" | "amount";
  value: number;
  isActive: boolean;
  expiryDate?: Date;
  maxUses?: number;
  usageCount: number;
  usedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;

  canBeUsed(): boolean;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      trim: true,
      uppercase: true,
      unique: true,
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
      validate: {
        validator: function (this: any, val: number) {
          const type = this.get ? this.get("type") : this.type;
          if (type === "percentage") return val <= 100;
          return true;
        },
        message: "Percentage discount cannot exceed 100%",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiryDate: {
      type: Date,
      index: true,
    },
    maxUses: {
      type: Number,
      min: [-1, "Max uses must be at least -1"],
      default: -1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedBy: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.methods.canBeUsed = function (): boolean {
  if (!this.isActive) return false;

  if (this.expiryDate && this.expiryDate < new Date()) return false;

  if (this.maxUses && this.usageCount >= this.maxUses) return false;

  return true;
};

couponSchema.pre("save", function (this: ICoupon, next: any) {
  if (this.expiryDate && this.expiryDate < new Date()) {
    this.isActive = false;
  }
  next();
});

couponSchema.pre("findOneAndUpdate", function (next: any) {
  const update: any = this.getUpdate();

  if (update?.expiryDate && update.expiryDate < new Date()) {
    update.isActive = false;
    this.setUpdate(update);
  }

  next();
});

export default mongoose.model<ICoupon>("Coupon", couponSchema);