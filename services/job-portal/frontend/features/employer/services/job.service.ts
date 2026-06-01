import apiClient, { ApiSuccessResponse } from "@/lib/api-client";

export interface GetMyJobPostingsResponse {
    count: number;
    jobPosts: any[];
}

export const getMyJobPostings = async () => {
    const response = await apiClient.get<ApiSuccessResponse<GetMyJobPostingsResponse>>("/jobs/my-jobs");
    return response.data;
}

export const createJobPost = async (jobData: any) => {
    console.log("Job data", jobData);
    const response = await apiClient.post<ApiSuccessResponse<any>>("/jobs", jobData);
    return response.data;
}

export const updateJobPostStatus = async (jobId: string, newStatus: string) => {
    //
}

export const deleteJobPost = async (jobId: string) => {
    const response = await apiClient.delete<ApiSuccessResponse<any>>(`/jobs/${jobId}`);
    return response.data;
}

export const updateJobPostDetails = async (jobId: string, jobData: any) => {
    //
}

export const getJobPostById = async (jobId: string) => {
    const response = await apiClient.get<ApiSuccessResponse<any>>(`/jobs/${jobId}`);
    return response.data;
}