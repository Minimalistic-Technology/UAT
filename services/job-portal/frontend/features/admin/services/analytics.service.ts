import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { AdminAnalyticsResponse } from "../types/analytics.type";

export const fetchAdminAnalytics = async () => {
  const response = await apiClient.get<ApiSuccessResponse<AdminAnalyticsResponse>>(`/admin/analytics`);
  return response.data;
};
