// models/leave.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ILeave extends Document {
  user_id: string;
  companyID: string;
  from: Date;
  to: Date;
  reason: string;
  email: string;
  leaveType: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  handledBy: string;
  appliedAt: Date;
  updatedAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
  {
    user_id: { type: String, required: true },
    companyID: { type: String, required: true, index: true, },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: { type: String },
    email: { type: String },
    leaveType: { type: String, required: true }, // ✅ added
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    handledBy: { type: String, ref: 'AuthUser' },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const LeaveModel = mongoose.model<ILeave>('Leave', LeaveSchema);
