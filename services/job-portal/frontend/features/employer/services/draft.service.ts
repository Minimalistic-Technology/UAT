import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { Draft } from "@/types/new-index";

export const saveDraft = async (data: {
  id?: string;
  type: "job" | "internship";
  formData: any;
}) => {
  const response = await apiClient.post<ApiSuccessResponse<Draft>>(
    "/drafts",
    data,
  );
  return response.data;
};

export const getDrafts = async () => {
  const response = await apiClient.get<ApiSuccessResponse<Draft[]>>("/drafts");
  return response.data;
};

export const getDraftById = async (draftId: string) => {
  const response = await apiClient.get<ApiSuccessResponse<Draft>>(
    `/drafts/${draftId}`,
  );
  return response.data;
};

export const deleteDraft = async (draftId: string) => {
  const response = await apiClient.delete<ApiSuccessResponse<null>>(
    `/drafts/${draftId}`,
  );
  return response.data;
};
