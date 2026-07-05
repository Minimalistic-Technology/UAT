import { KycStatus } from "@/types/enums";
import { Company } from "@/types";

export type CompanyMetrics = {
  totalJobs: number;
  activeJobs: number;
  activeInternships: number;
  activeListings: number;
  totalMembers: number;
  currentPlan: { _id: string; name: string } | null;
  subscription: any | null;
};

export type GetMyCompanyResponse = Omit<Company, "owner"> &
  CompanyMetrics & {
    owner: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    kycStatus: KycStatus & null;
    kycRejectionReason: string | null;
    remainingJobPosts: number | null;
  };

export interface CompanyDashboardDetails {
  id: string;
  name: string;
  isVerified: boolean;
  industry: string;
  activeListings: number;
  totalMembers: number;
  remainingJobPosts: number;
  currentPlan?: {
    name: string;
  };
  kycStatus: string;
  kycRejectionReason?: string;
}
