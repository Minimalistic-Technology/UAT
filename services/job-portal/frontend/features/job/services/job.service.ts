import apiClient, { ApiResponse } from "@/lib/axios";
import { Job } from "@/types";

export interface CreateJobPayload {
  title: string;
  description: string;
  jobType: string;
  experienceLevel: string;
  location: {
    city: string;
    country: string;
    remote: boolean;
  };
  salary: {
    min?: number;
    max?: number;
    currency: string;
    period: string;
  };
  skills: string[];
  requirements: string[];
  benefits?: string[];
  openings: number;
}

export const createJob = async (
  payload: CreateJobPayload
): Promise<ApiResponse<Job>> => {
  const response = await apiClient.post<ApiResponse<Job>>("/jobs", payload);
  return response.data;
};
