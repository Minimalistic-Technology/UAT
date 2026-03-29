import mongoose, { Document, Schema } from "mongoose";

export interface IPlan extends Document {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  jobPostLimit: number; // Use -1 for "Unlimited"
  isFeatured: boolean; // Does this plan allow "Featured" job labels?
  isDefault: boolean; // Is this the "Free" plan assigned on signup?
  displayOrder: number; // To control which plan shows first on the UI
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Plan price is required"],
      min: [0, "Price cannot be negative"],
    },
    durationDays: {
      type: Number,
      required: [true, "Duration in days is required"],
      min: [1, "Duration must be at least 1 day"],
    },
    jobPostLimit: {
      type: Number,
      required: [true, "Job post limit is required"],
      min: [-1, "Limit must be at least 1, or -1 for unlimited"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false, // Set to 'true' for your Basic/Free plan
    },
    displayOrder: {
      type: Number,
      default: 0, // Helps you sort Basic -> Pro -> Enterprise on your pricing page
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

planSchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model<IPlan>("Plan", planSchema);