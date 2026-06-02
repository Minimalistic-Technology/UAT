import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { Company, Job } from "@/types/new-index";

// ----------------------- Interfaces ---------------------------

export interface PublicCompanyDetails extends Company {
  totalJobs: number;
  activeJobs: number;
  totalMembers: number;
}

export interface CompanyJobsResponse {
  jobs: Job[];
  totalJobs: number;
  pagination: {
    page: number;
    totalPages: number;
  };
}

// --------------------- Services ---------------------------

export const getCompanyById = async (id: string) => {
  const response = await apiClient.get<ApiSuccessResponse<PublicCompanyDetails>>(`/companies/${id}`);
  return response.data;
};

export const getCompanyJobs = async (companyId: string, page = 1, limit = 10) => {
  const response = await apiClient.get<ApiSuccessResponse<CompanyJobsResponse>>(`/listings`, {
    params: {
      company: companyId,
      page,
      limit,
    },
  });
  return response.data;
};
