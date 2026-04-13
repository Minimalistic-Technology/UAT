import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getApplicationsByJobId, getAllEmployerApplications, updateApplicationStatus } from "../services/job-application.service";

export const useGetApplicationsByJobId = (jobId: string) => {
  return useQuery({
    queryKey: ["job-applications", jobId],
    queryFn: () => getApplicationsByJobId(jobId),
    enabled: !!jobId, 
  });
};

export const useAllEmployerApplications = (params?: { page?: number; limit?: number; status?: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ["all-employer-applications"] });
    },
  });
};