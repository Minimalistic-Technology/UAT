import mongoose, { Document, Schema } from "mongoose";

interface ICloudinaryAsset {
  url: string;
  publicId: string;
}

export interface IKYC extends Document {
  user: mongoose.Types.ObjectId;
  companyName: string;
  aadharNo: string;
  gstNo: string;
  cinNo: string;
  photo: ICloudinaryAsset;
  lightbill: ICloudinaryAsset;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  isLatest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const cloudinaryAssetSchema = new Schema<ICloudinaryAsset>(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const kycSchema = new Schema<IKYC>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // unique: true,
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
    photo: {
      type: cloudinaryAssetSchema,
      required: true,
    },

    lightbill: {
      type: cloudinaryAssetSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
    },
    isLatest: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IKYC>("KYC", kycSchema);
