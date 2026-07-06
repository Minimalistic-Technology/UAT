import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  src: string;
  title: string;
  description: string;
  github: string;
}

const templateSchema = new Schema<ITemplate>(
  {
    src: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    github: { type: String, required: true },
  },
  { timestamps: true }
);

export const TemplateModel = mongoose.model<ITemplate>('Template', templateSchema);
