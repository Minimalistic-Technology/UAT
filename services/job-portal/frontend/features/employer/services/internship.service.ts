import apiClient from "@/lib/api-client";
import { ApiSuccessResponse } from "@/lib/api-client";

export const createInternshipPost = async (internshipData: any) => {
  const response = await apiClient.post<ApiSuccessResponse<any>>("/internships", internshipData);
  return response.data;
};