import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { API_URL } from "@/constants";
import { GET_ALL_USERS_QUERY } from "../graphql/queries/user.queries";
import {
  FetchAllUsersResponse,
  FetchAllUsersParams,
  ToggleUserStatusResponse,
} from "../types";

export const toggleUserStatus = async (userId: string) => {
  const response = await apiClient.put<
    ApiSuccessResponse<ToggleUserStatusResponse>
  >(`/admin/users/${userId}/toggle-status`);
  return response.data;
};

export const fetchAllUsers = async ({ page, limit }: FetchAllUsersParams) => {
  const response = await apiClient.post(
    "/graphql",
    {
      query: GET_ALL_USERS_QUERY,
      variables: { page, limit },
    },
    {
      baseURL: API_URL.replace("/api", ""),
    },
  );

  return {
    success: true,
    data: response.data.data.getAllUsers,
    message: "Users fetched successfully",
  } as ApiSuccessResponse<FetchAllUsersResponse>;
};
