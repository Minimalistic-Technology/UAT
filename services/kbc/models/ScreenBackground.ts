import mongoose, { Schema, Document } from "mongoose";

export interface IMediaRef {
  public_id: string;
  url: string;
  type: string;
  format: string;
}

export interface IScreenBackground extends Document {
  screenName: string;
  mediaRef: IMediaRef;
  updatedAt: Date;
}

const MediaRefSchema = new Schema<IMediaRef>(
  {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    format: { type: String, required: true },
  },
  { _id: false }
);

const ScreenBackgroundSchema = new Schema<IScreenBackground>(
  {
    screenName: { type: String, required: true, unique: true },
    mediaRef: { type: MediaRefSchema, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IScreenBackground>("ScreenBackground", ScreenBackgroundSchema);
