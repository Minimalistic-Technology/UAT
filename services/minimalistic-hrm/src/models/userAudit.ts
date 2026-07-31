import mongoose, { Schema, Document } from "mongoose";

export interface IUserAudit extends Document {
  userId: string;
  changedBy: string;
  changes: { field: string; oldValue: any; newValue: any }[];
  reason?: string;
  timestamp: Date;
}

const userAuditSchema = new Schema<IUserAudit>({
  userId: { type: String, required: true },
  changedBy: { type: String, required: true },
  changes: [
    {
      field: String,
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed,
    },
  ],
  reason: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IUserAudit>("UserAudit", userAuditSchema);
