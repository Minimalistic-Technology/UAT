import apiClient, { ApiSuccessResponse } from "@/lib/api-client";


interface GetMyApplicationsResponse {
    applications: any[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    }
}

export interface ApplyJobPayload {
    jobId: string;
}

export const getMyApplications = async () => {
    const response = await apiClient.get<ApiSuccessResponse<GetMyApplicationsResponse>>('/applications/my-applications');
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