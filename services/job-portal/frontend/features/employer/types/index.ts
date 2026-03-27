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
