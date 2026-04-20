export interface GraphData {
  name: string;
  revenue?: number;
  users?: number;
  jobs?: number;
}

export interface AdminAnalyticsSummary {
  totalRevenue: number;
  revenueGrowth: number;
  activeUsers: number;
  jobListings: number;
  kycPending: number;
  totalCompanies: number;
  totalApplications: number;
}

export interface AdminAnalyticsResponse {
  summary: AdminAnalyticsSummary;
  graphs: {
    revenue: GraphData[];
    users: GraphData[];
    jobs: GraphData[];
  };
}
