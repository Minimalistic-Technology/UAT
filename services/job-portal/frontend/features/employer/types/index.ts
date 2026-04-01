export enum CompanyRole {
  OWNER = "owner",
  ADMIN = "admin",
  RECRUITER = "recruiter",
}

export interface FileUploadData {
  file: File;
  previewUrl?: string;
}

export interface KYCData {
  companyName: string;
  aadharNo: string;
  gstNo: string;
  cinNo: string;
  photo: File;
  lightbill: File;
}

export interface KYCSubmissionResponse {
  success: boolean;
  message: string;
  data?: {
    companyName: string;
    aadharNo: string;
    gstNo: string;
    cinNo: string;
    documents: {
      photoUrl: string;
      lightbillUrl: string;
    };
  };
}

export interface Plan {
  _id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  durationDays: number;
  jobPostLimit: number;
  isFeatured: boolean;
  isDefault: boolean;
  displayOrder: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
