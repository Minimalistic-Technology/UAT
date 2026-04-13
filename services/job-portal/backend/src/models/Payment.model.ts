import mongoose, { Schema, Document, Model, Types } from "mongoose";

export enum PaymentStatus {
  CREATED = "created",
  AUTHORIZED = "authorized",
  CAPTURED = "captured",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export interface IPayment extends Document {
  userId: Types.ObjectId;
  amount: number; // in paise
  currency: string;

  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  webhookEvents: {
    eventId?: string;
    type?: string;
    receivedAt: Date;
  }[];

  metadata: Map<string, any>;

  method?: "card" | "upi" | "netbanking" | "wallet";

  failureReason?: string;

  refundId?: string;
  refundAmount?: number;

  status: PaymentStatus;
  receipt?: string;

  capturedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema<IPayment> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than 0"],
    },

    currency: {
      type: String,
      enum: ["INR", "USD", "EUR", "GBP"], // extend if needed
      default: "INR",
      uppercase: true,
      trim: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      index: true,
      sparse: true,
    },

    razorpaySignature: {
      type: String,
    },

    webhookEvents: [
      {
        eventId: { type: String },
        type: { type: String },
        receivedAt: { type: Date, default: Date.now },
      },
    ],

    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },

    method: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet"],
    },

    failureReason: {
      type: String,
    },

    refundId: {
      type: String,
    },

    refundAmount: {
      type: Number,
    },

    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.CREATED,
      index: true,
    },

    receipt: {
      type: String,
      trim: true,
    },

    capturedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

PaymentSchema.index({ userId: 1, status: 1 });

PaymentSchema.index(
  { "metadata.internalOrderId": 1 },
  { unique: true, sparse: true },
);

PaymentSchema.index({ razorpayPaymentId: 1 });

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
