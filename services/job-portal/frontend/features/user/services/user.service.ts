import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { User } from "@/types";

export const getUserById = async (id: string) => {
  const response = await apiClient.get<ApiSuccessResponse<User>>(
    `/users/${id}`,
  );
  return response.data;
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
