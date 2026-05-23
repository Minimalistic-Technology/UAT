"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAdminAnalytics } from "../services/analytics.service";

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const data = await fetchAdminAnalytics();
      return data;
    },
  });
};
