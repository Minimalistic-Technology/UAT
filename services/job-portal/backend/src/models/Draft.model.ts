import mongoose, { Document, Schema } from "mongoose";

export interface IDraft extends Document {
  company: mongoose.Types.ObjectId;
  postedBy: mongoose.Types.ObjectId;
  type: "job" | "internship";
  formData: any;
  createdAt: Date;
  updatedAt: Date;
}

const draftSchema = new Schema<IDraft>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["job", "internship"],
      required: true,
    },
    formData: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Draft = mongoose.model<IDraft>("Draft", draftSchema);
export default Draft;
