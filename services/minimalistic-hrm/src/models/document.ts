import mongoose, { Schema, Document } from "mongoose";

export interface IMediaRef {
  public_id: string;
  url: string;
  type: string;   
  format: string; 
}

export interface IEmployeeDocument {
  docType:
    | "AADHAAR"
    | "PAN"
    | "PASSPORT"
    | "DRIVING_LICENSE"
    | "VOTER_ID"
    | "BANK_PROOF"
    | "SALARY_SLIP"
    | "OFFER_LETTER"
    | "APPOINTMENT_LETTER"
    | "EXPERIENCE_LETTER"
    | "RESUME"
    | "PHOTO"
    | "EDUCATION_CERTIFICATE"
    | "OTHER";

  document: IMediaRef;
  uploadedAt: Date;
  verified: boolean;
}

export interface IEmployeeDocs extends Document {
  employeeId: string;
  companyID: string;
  documents: IEmployeeDocument[];
}

const MediaSchema = new Schema<IMediaRef>(
  {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    format: { type: String, required: true },
  }
);

const EmployeeDocumentSchema = new Schema<IEmployeeDocument>(
  {
    docType: {
      type: String,
      enum: [
        "AADHAAR",
        "PAN",
        "PASSPORT",
        "DRIVING_LICENSE",
        "VOTER_ID",
        "BANK_PROOF",
        "SALARY_SLIP",
        "OFFER_LETTER",
        "APPOINTMENT_LETTER",
        "EXPERIENCE_LETTER",
        "RESUME",
        "PHOTO",
        "EDUCATION_CERTIFICATE",
        "OTHER",
      ],
      required: true,
    },

    document: {
      type: MediaSchema,
      required: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const EmployeeDocsSchema = new Schema<IEmployeeDocs>(
  {
    employeeId: {
      type: String,
      required: true,
      index: true,
    },

    companyID: {
      type: String,
      required: true,
      index: true,
    },

    documents: {
      type: [EmployeeDocumentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const EmployeeDocsModel = mongoose.model<IEmployeeDocs>(
  "EmployeeDocuments",
  EmployeeDocsSchema
);
