import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { User } from "@/types";
import { API_URL } from "@/constants";
import { GET_USER_BY_ID_QUERY } from "../graphql/queries/user.queries";

export const getUserById = async (id: string) => {
  const response = await apiClient.post(
    "/graphql",
    {
      query: GET_USER_BY_ID_QUERY,
      variables: { id },
    },
    {
      baseURL: API_URL.replace("/api", ""),
    },
  );
  return {
    success: true,
    data: response.data.data.getUserById,
    message: "User fetched successfully",
  } as ApiSuccessResponse<User>;
};

export const updateProfile = async (data: any) => {
  const response = await apiClient.put<ApiSuccessResponse<User>>(
    `/users/profile`,
    data,
  );
  return response.data;
};

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await apiClient.put<ApiSuccessResponse<User>>(
    `/users/resume`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};
