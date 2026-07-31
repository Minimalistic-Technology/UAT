import { KYC, Pagination } from "@/types";

export type GetKycApplicationsParams = {
  page: number;
  limit: number;
  status?: string;
};

export type KycWithUser = Omit<KYC, "userId"> & {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  companyDocument?: any; // StorageAsset
  personalDocument?: any; // StorageAsset
};

export type GetKycApplicationsResponse = {
  count: number;
  applications: KycWithUser[];
  pagination: Pagination;
};

export type UpdateKycApplicationStatusParams = {
  applicationId: string;
  status: string;
  note?: string;
};

export type UpdateKycApplicationStatusResponse = {
  kycApplication: KYC;
};
