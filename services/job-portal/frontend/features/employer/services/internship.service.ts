import apiClient from "@/lib/api-client";
import { ApiSuccessResponse } from "@/lib/api-client";

export interface GetMyInternshipPostingsResponse {
    count: number;
    internshipPosts: any[];
}

export const getMyInternshipPostings = async () => {
    const response = await apiClient.get<ApiSuccessResponse<GetMyInternshipPostingsResponse>>("/internships/my-internships");
    return response.data;
}

export const createInternshipPost = async (internshipData: any) => {
  const response = await apiClient.post<ApiSuccessResponse<any>>("/internships", internshipData);
  return response.data;
};

export const updateInternshipPostStatus = async (internshipId: string, newStatus: string) => {
    //
}

export const deleteInternshipPost = async (internshipId: string) => {
    const response = await apiClient.delete<ApiSuccessResponse<any>>(`/internships/${internshipId}`);
    return response.data;
}

export const updateInternshipPostDetails = async (internshipId: string, internshipData: any) => {
    //
}

export const getInternshipPostById = async (internshipId: string) => {
    const response = await apiClient.get<ApiSuccessResponse<any>>(`/internships/${internshipId}`);
    return response.data;
}