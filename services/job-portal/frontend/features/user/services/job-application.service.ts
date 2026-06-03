import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { ListingType } from "@/types/enums";

interface GetMyApplicationsResponse {
    applications: any[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    }
}

export interface GetMyApplicationStatsResponse {
    total: number;
    pending: number;
    shortlisted: number;
    rejected: number;
}

export interface ApplyJobPayload {
    listingId: string;
    listingType: ListingType;
}

export const getMyApplications = async () => {
    const response = await apiClient.get<ApiSuccessResponse<GetMyApplicationsResponse>>('/applications/my-applications');
    return response.data;
}

export const getMyApplicationStats = async () => {
    const response = await apiClient.get<ApiSuccessResponse<GetMyApplicationStatsResponse>>('/applications/my-stats');
    return response.data;
}

export const getApplicationById = async (id: string) => {
    const response = await apiClient.get<ApiSuccessResponse<any>>(`/applications/${id}`);
    return response.data;
}

export const applyJob = async (data: ApplyJobPayload) => {
    const response = await apiClient.post<ApiSuccessResponse<any>>("/applications", data);
    return response.data;
}

export const withdrawJobApplication = async(appId: string) => {
    const response = await apiClient.delete<ApiSuccessResponse<null>>(`/applications/${appId}`);
    return response.data;
}