import { apiClient } from '../api';
import { Job } from '@/types';

export interface JobFilters {
  search?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  minSalary?: number;
  maxSalary?: number;
  skills?: string;
  remote?: boolean;
  page?: number;
  limit?: number;
}

class JobService {
  async getJobs(filters: JobFilters = {}) {
    const queryString = new URLSearchParams(
      Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return apiClient.get<{
      success: boolean;
      data: Job[];
      total: number;
      totalPages: number;
      currentPage: number;
    }>(`/jobs?${queryString}`);
  }

  async getJob(id: string) {
    return apiClient.get<{ success: boolean; data: Job }>(`/jobs/${id}`);
  }

  async createJob(data: Partial<Job>) {
    return apiClient.post<{ success: boolean; data: Job }>('/jobs', data);
  }

  async updateJob(id: string, data: Partial<Job>) {
    console.log(`id: ${id} and data: ${JSON.stringify(data)}`);
    const response =  apiClient.patch<{ success: boolean; data: Job }>(`/jobs/${id}`, data);
    console.log("response: ", response);

    return response;
  }

  async deleteJob(id: string) {
    return apiClient.delete(`/jobs/${id}`);
  }

  async getMyJobs() {
    return apiClient.get<{ success: boolean; data: Job[] }>('/jobs/my-jobs');
  }
}

export const jobService = new JobService();