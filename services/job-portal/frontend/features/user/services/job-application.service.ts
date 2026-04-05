import apiClient, { ApiSuccessResponse } from "@/lib/api-client";


interface GetMyApplicationsResponse {
    applications: any[];
    count: number;
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