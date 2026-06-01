import { KycStatus } from "@/types/enums";
import { Company } from "@/types/new-index";

export type CompanyMetrics = {
  totalJobs: number;
  activeJobs: number;
  activeInternships: number;
  activeListings: number;
  totalMembers: number;
  currentPlan: { _id: string; name: string } | null;
  subscription: any | null;
}

export type GetMyCompanyResponse =
  Omit<Company, "owner"> &
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