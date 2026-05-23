// models/company.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompany extends Document {
  name: string;
  companyType: string;
  employeeCount: number;
  admin?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  status: "active" | "suspended" | "inactive";
  CompanyLeaves: {
    totalLeaves: number;
    casualLeaves: number;
    sickLeaves: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
const CompanySchema: Schema<ICompany> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    companyType: {
      type: String,
      enum: ["IT", "Finance", "Manufacturing", "Service", "Other"],
      required: true,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "suspended", "inactive"],
      default: "active",
    },

    employeeCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    CompanyLeaves: {
      totalLeaves: { type: Number, default: 30 },
      casualLeaves: { type: Number, default: 12 },
      sickLeaves: { type: Number, default: 12 },
    },
  },
  { timestamps: true }
);

CompanySchema.index({ status: 1 });

export const CompanyModel: Model<ICompany> =
  mongoose.models.Company ||
  mongoose.model<ICompany>("Company", CompanySchema);

export default CompanyModel;