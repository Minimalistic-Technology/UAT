import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { Job } from "@/types";

interface GetJobsParams {
  //
}

interface GetJobsResponse {
  jobs: Job[];
  totalJobs: number;
  pagination: {
    page: number;
    totalPages: number;
  };
}

export const getJobs = async (filters: any = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(filters).reduce(
      (acc, [key, value]) => {
        const isValidValue =
          value !== undefined && value !== null && value !== "";
        const isNonEmptyArray = Array.isArray(value) ? value.length > 0 : true;

        if (
          isValidValue &&
          isNonEmptyArray &&
          (key !== "remote" || value === true)
        ) {
          acc[key] = Array.isArray(value) ? value.join(",") : String(value);
        }
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();

  const response = await apiClient.get<ApiSuccessResponse<GetJobsResponse>>(
    `/listings?${queryString}`,
  );
  return response.data;
};

export const getJobDetailsById = async (jobId: string) => {
  const response = await apiClient.get<ApiSuccessResponse<any>>(
    `/jobs/${jobId}`,
  );
  return response.data;
};
