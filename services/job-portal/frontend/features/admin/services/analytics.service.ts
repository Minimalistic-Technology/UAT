import apiClient, { ApiSuccessResponse } from "@/lib/api-client";

// -------------------------------- Interface -----------------------

export interface GraphData {
  name: string;
  revenue?: number;
  users?: number;
  jobs?: number;
  internships?: number;
}

export interface AdminAnalyticsSummary {
  totalRevenue: number;
  revenueGrowth: number;
  activeUsers: number;
  jobListings: number;
  internshipListings: number;
  kycPending: number;
  totalCompanies: number;
  totalApplications: number;
  revenueCurrency: "INR" | "USD" | "EUR" | "GDP",
}

export interface AdminAnalyticsResponse {
  summary: AdminAnalyticsSummary;
  graphs: {
    revenue: GraphData[];
    users: GraphData[];
    jobs: GraphData[];
    internships: GraphData[];
  };
}


// -------------------------------- Service ---------------------------

export const fetchAdminAnalytics = async () => {
  const response = await apiClient.get<ApiSuccessResponse<AdminAnalyticsResponse>>(`/admin/analytics`);
  return response.data;
};
