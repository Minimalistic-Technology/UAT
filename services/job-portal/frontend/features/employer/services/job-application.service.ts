import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { API_URL } from "@/constants";
import { Application } from "../types";
import { Education, Experience } from "@/types";
import {
  GetAllEmployerApplicationsResponse,
  DashboardApplicationsResponse,
} from "../types/application.type";
import { GET_DASHBOARD_APPLICATIONS_QUERY } from "../graphql/queries/application.queries";

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
    resume?: string;
  };
};

interface JobApplicationsResponse {
  count: number;
  applications: ApplicationWithUser[];
}

export const getApplicationsByJobId = async (
  listingId: string,
  listingType: string,
) => {
  const response = await apiClient.post<
    ApiSuccessResponse<JobApplicationsResponse>
  >(`/applications/jobs/my-applications`, { listingId, listingType });
  return response.data;
};

export const getAllEmployerApplications = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  const response = await apiClient.get<
    ApiSuccessResponse<GetAllEmployerApplicationsResponse>
  >("/applications/company/all", { params });
  return response.data;
};

export const updateApplicationStatus = async ({
  applicationId,
  status,
  note,
  interviewDate,
}: {
  applicationId: string;
  status: string;
  note?: string;
  interviewDate?: string;
}) => {
  const response = await apiClient.put(
    `/applications/${applicationId}/status`,
    {
      status,
      note,
      interviewDate,
    },
  );
  return response.data;
};

export const getDashboardApplications = async (params: {
  page: number;
  limit: number;
}) => {
  const response = await apiClient.post(
    "/graphql",
    {
      query: GET_DASHBOARD_APPLICATIONS_QUERY,
      variables: params,
    },
    {
      baseURL: API_URL.replace("/api", ""),
    },
  );
  return {
    success: true,
    data: response.data.data.getDashboardApplications,
    message: "Dashboard applications fetched successfully",
  } as ApiSuccessResponse<DashboardApplicationsResponse>;
};
