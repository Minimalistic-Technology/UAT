import apiClient, { ApiSuccessResponse } from "@/lib/api-client";

interface GetMyApplicationsResponse {
    applications: any[];
    count: number;
}

export const getMyApplications = async () => {
    const response = await apiClient.get<ApiSuccessResponse<GetMyApplicationsResponse>>('/applications/my-applications');
    return response.data;
}