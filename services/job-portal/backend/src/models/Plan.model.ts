import mongoose, { Document, Schema } from "mongoose";

export interface IPlan extends Document {
  name: string;
  description?: string;
  price: number; // Stored as an Integer (e.g., 1089 instead of 10.89)
  currency: string; // e.g., "INR", "USD"
  durationDays: number;
  jobPostLimit: number;
  teamMemberLimit: number;
  isFeatured: boolean;
  isDefault: boolean;
  displayOrder: number;
  features: string[];
  isActive: boolean;
  allowResumeDownload: boolean;
  postValidityDays: number;
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
    /**
     * PRICE LOGIC:
     * - We store '10.89' as '1089' (Integer) in MongoDB.
     * - 'set' converts user input (10.89) -> 1089 before saving.
     * - 'get' converts database value (1089) -> 10.89 when reading.
     */
    price: {
      type: Number,
      required: [true, "Plan price is required"],
      min: [0, "Price cannot be negative"],
      set: (v: number) => Math.round(v * 100), 
      get: (v: number) => v / 100,             
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
      enum: ["INR", "USD", "EUR", "GBP"], 
      default: "INR",
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
    teamMemberLimit: {
      type: Number,
      required: [true, "Team member limit is required"],
      min: [-1, "Limit must be at least 0, or -1 for unlimited"],
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    allowResumeDownload: {
      type: Boolean,
      require: true
    },
    postValidityDays: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
    // CRITICAL: This ensures 'get' runs when you send JSON to the frontend
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

planSchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model<IPlan>("Plan", planSchema);