import apiClient, { ApiResponse } from "@/lib/axios";
import { KYCSubmissionResponse } from "./types/kyc.types";

export const submitKyc = async (data: FormData): Promise<ApiResponse<KYCSubmissionResponse>> => {
  const response = await apiClient.post<ApiResponse<KYCSubmissionResponse>>(
    "/users/kyc",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};