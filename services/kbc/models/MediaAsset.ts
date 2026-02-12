import mongoose, { Schema, Document } from "mongoose";

export interface IMediaAsset extends Document {
  _id: string;
  provider: string;
  url: string;
  metadata?: any;
  createdAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    _id: { type: String },
    provider: { type: String, default: "cloudinary" },
    url: { type: String, required: true },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model<IMediaAsset>("MediaAsset", MediaAssetSchema);
