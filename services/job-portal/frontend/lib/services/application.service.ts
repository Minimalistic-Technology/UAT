import { apiClient } from '../api';
import { Application } from '@/types';

export interface ApplyJobData {
  jobId: string;
  resume?: string;
  coverLetter?: string;
}

class ApplicationService {
  async applyForJob(data: ApplyJobData) {
    return apiClient.post<{ success: boolean; data: Application }>(
      '/applications',
      data
    );
  }

  async getMyApplications() {
    return apiClient.get<{ success: boolean; data: Application[] }>(
      '/applications/my-applications'
    );
  }

  async getJobApplicants(jobId: string) {
    return apiClient.get<{ success: boolean; data: Application[] }>(
      `/applications/job/${jobId}`
    );
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string,
    note?: string
  ) {
    return apiClient.put(`/applications/${applicationId}/status`, {
      status,
      note,
    });
  }

  async withdrawApplication(applicationId: string) {
    return apiClient.delete(`/applications/${applicationId}`);
  }
}

export const applicationService = new ApplicationService();