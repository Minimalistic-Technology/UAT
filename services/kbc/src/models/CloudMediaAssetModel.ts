import mongoose, { Document, Schema } from 'mongoose';

export type Thumbnail = {
  size: string;
  url: string;
  public_id?: string;
};

export type DerivedAsset = {
  label?: string;
  width?: number;
  height?: number;
  url: string;
  public_id?: string;
  filesize?: number;
};

export interface ICloudMediaAsset extends Document {
  cloudinaryId: string;
  originalUrl: string;
  derived: DerivedAsset[];
  thumbnails: Thumbnail[];
  type: 'image' | 'video' | 'audio' | 'other';
  mime: string;
  size: number;
  width?: number;
  height?: number;
  uploadedBy?: mongoose.Types.ObjectId | string;
  questionId?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  deleted?: boolean;
}

const DerivedSchema = new Schema<DerivedAsset>(
  {
    label: { type: String },
    width: { type: Number },
    height: { type: Number },
    url: { type: String, required: true },
    public_id: { type: String },
    filesize: { type: Number },
  },
  { _id: false }
);

const ThumbSchema = new Schema<Thumbnail>(
  {
    size: { type: String },
    url: { type: String, required: true },
    public_id: { type: String },
  },
  { _id: false }
);

const CloudMediaAssetSchema = new Schema<ICloudMediaAsset>({
  cloudinaryId: { type: String, required: true, index: true },
  originalUrl: { type: String, required: true },
  derived: { type: [DerivedSchema], default: [] },
  thumbnails: { type: [ThumbSchema], default: [] },
  type: { type: String, required: true },
  mime: { type: String },
  size: { type: Number },
  width: { type: Number },
  height: { type: Number },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
  createdAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
});

export const CloudMediaAssetModel = mongoose.model<ICloudMediaAsset>(
  'CloudMediaAsset',
  CloudMediaAssetSchema
);
