import mongoose, { Schema, Document } from "mongoose";

export interface IAgeContent extends Document {
  ageGroup: "kids" | "teens" | "adults";
  title: string;
  description: string;
  category: string;
  mediaRefs?: string[];
  recommendations?: string[];
  createdAt: Date;
}

const AgeContentSchema = new Schema<IAgeContent>(
  {
    ageGroup: {
      type: String,
      enum: ["kids", "teens", "adults"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    mediaRefs: [String],
    recommendations: [String],
  },
  { timestamps: true }
);

export default mongoose.model<IAgeContent>("AgeContent", AgeContentSchema);
