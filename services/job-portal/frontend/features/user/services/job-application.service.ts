import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { ListingType } from "@/types/enums";

// ---------------------------------- Interface ------------------------------------

interface GetMyApplicationsResponse {
  applications: any[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface GetMyApplicationStatsResponse {
  total: number;
  byStatus: {
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
    interview: number;
    offered: number;
    accepted: number;
    withdrawn: number;
  };
  byListingType: {
    job: number;
    internship: number;
  };
}

export interface ApplyJobPayload {
  listingId: string;
  listingType: ListingType;
}

// ---------------------------------- Service -----------------------------------

export const getMyApplications = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get<
    ApiSuccessResponse<GetMyApplicationsResponse>
  >("/applications/my-applications", { params });
  return response.data;
};

export const getMyApplicationStats = async () => {
  const response = await apiClient.get<
    ApiSuccessResponse<GetMyApplicationStatsResponse>
  >("/applications/my-stats");
  return response.data;
};

export const getApplicationById = async (id: string) => {
  const response = await apiClient.get<ApiSuccessResponse<any>>(
    `/applications/${id}`,
  );
  return response.data;
};

export const applyJob = async (data: ApplyJobPayload) => {
  const response = await apiClient.post<ApiSuccessResponse<any>>(
    "/applications",
    data,
  );
  return response.data;
};
