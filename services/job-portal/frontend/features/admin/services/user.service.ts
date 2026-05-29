import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import {
  FetchAllUsersResponse,
  FetchAllUsersParams,
  ToggleUserStatusResponse,
} from "../types";

export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  const response = await apiClient.put<
    ApiSuccessResponse<ToggleUserStatusResponse>
  >(`/admin/users/${userId}/toggle-status`, { isActive });
  return response.data;
};

export const fetchAllUsers = async ({ page, limit }: FetchAllUsersParams) => {
  const response = await apiClient.get<
    ApiSuccessResponse<FetchAllUsersResponse>
  >(`/admin/users`, { params: { page, limit } });
  return response.data;
};
