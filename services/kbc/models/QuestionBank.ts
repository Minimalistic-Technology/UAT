import mongoose, { Schema, Document } from "mongoose";

export interface IQuestionBank extends Document {
  name: string;
  slug: string;
  description?: string;
  categories: string[];
  ageGroup?: string;
  defaultTimer: number;
  bankImage?: string; 
  position: number;
  label: string;
  enabled: boolean;
  published: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionBankSchema = new Schema<IQuestionBank>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    categories: [String],
    ageGroup: { type: String, enum: ["child", "teen", "adult"] },
    defaultTimer: { type: Number, default: 30 },
    bankImage: { type: String },
    position: { type: Number, unique: true },
    label: { type: String },
    enabled: { type: Boolean, default: true },
    published: { type: Boolean, default: false },
    createdBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestionBank>("QuestionBank", QuestionBankSchema);
