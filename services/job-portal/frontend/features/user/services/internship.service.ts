import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { Internship } from "@/types/new-index";

// -------------------- Interface ------------------------

export type InternshipDetailsResponse = Omit<
  Internship,
  "postedBy" | "company"
> & {
  postedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  company: {
    _id: string;
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
