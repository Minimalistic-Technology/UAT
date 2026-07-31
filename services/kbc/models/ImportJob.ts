import mongoose, { Document, Schema } from "mongoose";

export type ImportJobStatus = "queued" | "processing" | "completed" | "failed" | "partial";

export interface IImportJob extends Document {
  createdAt: Date;
  updatedAt: Date;
  status: ImportJobStatus;
  totalRows: number;
  successCount: number;
  errorRows: Array<{
    row: number;
    errors: string[];
    raw?: any;
  }>;
  fileName?: string;
  startedAt?: Date;
  finishedAt?: Date;
  meta?: any;
}

const ImportJobSchema = new Schema<IImportJob>(
  {
    status: { type: String, enum: ["queued","processing","completed","failed","partial"], default: "queued" },
    totalRows: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    errorRows: [
      {
        row: Number,
        errors: [String],
        raw: Schema.Types.Mixed,
      },
    ],
    fileName: String,
    startedAt: Date,
    finishedAt: Date,
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const ImportJob = mongoose.model<IImportJob>("ImportJob", ImportJobSchema);
export default ImportJob;
