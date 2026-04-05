import apiClient, { ApiSuccessResponse } from "@/lib/api-client";

interface FetchAllUsersParams {
    page?: number;
    limit?: number;
}

export const toggleUserStatus = async (userId: string, isActive: boolean) => {
    const response = await apiClient.put<ApiSuccessResponse<any>>(`/admin/users/${userId}/toggle-status`, { isActive });
    return response.data;
}

export const fetchAllUsers = async ({ page, limit }: FetchAllUsersParams) => {
    const response = await apiClient.get<ApiSuccessResponse<any>>(`/admin/users`, { params: { page, limit } });
    return response.data;
}