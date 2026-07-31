import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getApplicationsByJobId,
  getAllEmployerApplications,
  updateApplicationStatus,
  getDashboardApplications,
} from "../services/job-application.service";

export const useGetDashboardApplications = (params: {
  page: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: ["dashboard-applications", params],
    queryFn: () => getDashboardApplications(params),
  });
};

export const useGetApplicationsByJobId = (
  listingId: string,
  listingType: string,
) => {
  return useQuery({
    queryKey: ["job-applications", listingId, listingType],
    queryFn: () => getApplicationsByJobId(listingId, listingType),
    enabled: !!listingId && !!listingType,
  });
};

export const useAllEmployerApplications = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["all-employer-applications", params],
    queryFn: () => getAllEmployerApplications(params),
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      queryClient.invalidateQueries({
        queryKey: ["all-employer-applications"],
      });
    },
  });
};
