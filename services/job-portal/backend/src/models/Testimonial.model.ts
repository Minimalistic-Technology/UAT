import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
    name: string;
    role: string;
    company?: string;
    content: string;
    avatarUrl?: string;
    rating?: number;
    isActive: boolean;
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TestimonialSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            required: true,
            trim: true,
        },
        company: {
            type: String,
            trim: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        avatarUrl: {
            type: String,
            default: "",
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 5,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const Testimonial = mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
