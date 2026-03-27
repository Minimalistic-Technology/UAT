import mongoose, { Schema } from "mongoose";

export enum CompanyRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  RECRUITER = 'recruiter',
}

interface ICompanyMember extends Document {
  user: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  role: CompanyRole;
  isActive: boolean;
}

const companyMemberSchema = new Schema<ICompanyMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(CompanyRole),
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

companyMemberSchema.index({ user: 1, company: 1 }, { unique: true });

export default mongoose.model<ICompanyMember>(
  'CompanyMember',
  companyMemberSchema
);