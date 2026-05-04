import mongoose, { Document, Schema } from "mongoose";

export interface IKYC extends Document {
  user: mongoose.Types.ObjectId;
  companyName: string;
  aadharNo: string;
  gstNo: string;
  cinNo: string;
  photoUrl: string;
  lightbillUrl: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const kycSchema = new Schema<IKYC>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    aadharNo: {
      type: String,
      required: [true, "Aadhar number is required"],
      trim: true,
    },
    gstNo: {
      type: String,
      required: [true, "GST number is required"],
      trim: true,
    },
    cinNo: {
      type: String,
      required: [true, "CIN number is required"],
      trim: true,
    },
    photoUrl: {
      type: String,
      required: [true, "Photo URL is required"],
    },
    lightbillUrl: {
      type: String,
      required: [true, "Lightbill URL is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IKYC>("KYC", kycSchema);
