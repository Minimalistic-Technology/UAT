import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { FlattenedInternship } from "@/types";

// -------------------- Interface ------------------------

export type InternshipDetailsResponse = Omit<
  FlattenedInternship,
  "postedById" | "companyId" | "postedBy" | "company"
> & {
  postedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  company: {
    id: string;
    name: string;
    logo: string;
    description: string;
    website: string;
    location: string;
    industry: string;
    companySize: string;
  };
};

// -------------------- Service ------------------------

export const getInternshipDetailsById = async (internshipId: string) => {
  const response = await apiClient.get<
    ApiSuccessResponse<InternshipDetailsResponse>
  >(`/internships/${internshipId}`);
  return response.data;
};

export const getRelatedInternshipsById = async (internshipId: string) => {
  const response = await apiClient.get<ApiSuccessResponse<any>>(
    `/internships/${internshipId}/related`,
  );
  return response.data;
};
