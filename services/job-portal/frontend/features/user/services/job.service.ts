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
    }
}

export const getJobs = async (filters: any = {}) => {
    const queryString = new URLSearchParams(
        Object.entries(filters).reduce(
            (acc, [key, value]) => {
                if (value !== undefined && value !== null) {
                    acc[key] = String(value);
                }
                return acc;
            },
            {} as Record<string, string>,
        ),
    ).toString();

    const response = await apiClient.get<ApiSuccessResponse<GetJobsResponse>>(`/jobs?${queryString}`);
    return response.data;
}