import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type LinkType = 'link' | 'pdf';

export interface ILink extends Document {
  user: Types.ObjectId;
  type: LinkType;
  title: string;
  url: string;
  thumbnailUrl: string;
  cloudinaryPublicId: string;
  order: number;
  isActive: boolean;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new Schema<ILink>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['link', 'pdf'], default: 'link' },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    url: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, default: '' },
    cloudinaryPublicId: { type: String, default: '' }, // set when asset was uploaded via our Cloudinary upload
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    clickCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

LinkSchema.index({ user: 1, order: 1 });

const Link: Model<ILink> = mongoose.model<ILink>('Link', LinkSchema);
export default Link;
