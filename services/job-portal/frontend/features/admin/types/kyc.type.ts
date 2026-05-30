import { Kyc, Pagination } from "@/types/new-index";

export type GetKycApplicationsParams = {
  page: number;
  limit: number;
  status?: string;
};

export type KycWithUser = Omit<Kyc, "user"> & {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type GetKycApplicationsResponse = {
  count: number;
  applications: KycWithUser[];
  pagination: Pagination;
}

export type UpdateKycApplicationStatusParams = {
  applicationId: string;
  status: string;
  note?: string;
}

export type UpdateKycApplicationStatusResponse = {
  kycApplication: Kyc;
}
