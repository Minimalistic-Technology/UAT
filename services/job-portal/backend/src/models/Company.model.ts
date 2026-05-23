import mongoose, { Document, Schema } from 'mongoose';
import { ICloudinaryAsset, cloudinaryAssetSchema } from './KYC.model.js';

export interface ICompany extends Document {
  name: string;
  description: string;
  logo?: ICloudinaryAsset;
  website?: string;
  industry: string;
  companySize: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  owner: mongoose.Types.ObjectId;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: ""
    },
    logo: cloudinaryAssetSchema,
    website: String,
    industry: {
      type: String,
      required: true,
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    },
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICompany>('Company', companySchema);