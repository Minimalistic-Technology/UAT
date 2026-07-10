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
  revenueCurrency: "INR" | "USD" | "EUR" | "GBP";
}

export interface RecentEmployer {
  id: string;
  name: string;
  isVerified: boolean;
  kycStatus: "PENDING" | "REJECTED" | "APPROVED";
  createdAt: Date;
}

export interface TopCoupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "percentage" | "fixed";
  value: number;
  isActive: boolean;
  usageCount: number;
  maxUses: number;
}

export interface AdminAnalyticsResponse {
  summary: AdminAnalyticsSummary;
  graphs: {
    revenue: GraphData[];
    users: GraphData[];
    jobs: GraphData[];
    internships: GraphData[];
  };
  recentEmployers: RecentEmployer[];
  topCoupons: TopCoupon[];
}

// -------------------------------- Service ---------------------------

export const fetchAdminAnalytics = async () => {
  const response =
    await apiClient.get<ApiSuccessResponse<AdminAnalyticsResponse>>(
      `/admin/analytics`,
    );
    console.log("response data", response.data)
  return response.data;
};
