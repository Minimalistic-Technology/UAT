import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, "Content must be at least 10 characters long"],
      maxlength: [1000, "Content cannot exceed 1000 characters"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  { timestamps: true },
);

export const Testimonial = mongoose.model<ITestimonial>(
  "Testimonial",
  TestimonialSchema,
);
