import mongoose, { Document, Schema } from "mongoose";

export interface ICloudinaryAsset {
  url: string;
  publicId: string;
}

export interface IKYC extends Document {
  user: mongoose.Types.ObjectId;
  companyDocument: ICloudinaryAsset;
  companyDocumentType: string;
  personalDocument: ICloudinaryAsset;
  personalDocumentType: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  isLatest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const cloudinaryAssetSchema = new Schema<ICloudinaryAsset>(
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
    companyDocument: {
      type: cloudinaryAssetSchema,
      required: true,
    },
    companyDocumentType: {
      type: String,
      required: [true, "Company document type is required"],
      trim: true,
    },
    personalDocument: {
      type: cloudinaryAssetSchema,
      required: true,
    },
    personalDocumentType: {
      type: String,
      required: [true, "Personal document type is required"],
      trim: true,
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
