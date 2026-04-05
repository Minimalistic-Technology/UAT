import { useQuery } from "@tanstack/react-query"
import { getApplicationsByJobId } from "../services/job-application.service";

export const useGetApplicationsByJobId = (jobId: string) => {
  return useQuery({
    queryKey: ["job-applications", jobId],
    queryFn: () => getApplicationsByJobId(jobId),
    enabled: !!jobId, 
  });
};