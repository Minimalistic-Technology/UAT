import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { Application } from "../types";
import { Education, Experience } from "@/types";

export type ApplicationWithUser = Omit<Application, "jobSeeker"> & {
    jobSeeker: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        skills: string[];
        experience: Experience[];
        education: Education[];
    }
}


interface JobApplicationsResponse {
    count: number;
    applications: ApplicationWithUser[]
}

export const getApplicationsByJobId = async (jobId: string) => {
    const response = await apiClient.get<ApiSuccessResponse<JobApplicationsResponse>>(`/applications/job/${jobId}`);
    return response.data
}