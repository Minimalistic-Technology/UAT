import { useQuery } from "@tanstack/react-query"
import { getApplicationsByJobId, getAllEmployerApplications } from "../services/job-application.service";

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