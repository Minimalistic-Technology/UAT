import { useQuery } from "@tanstack/react-query";
import {
  getJobDetailsById,
  getJobs,
  getRelatedJobsById,
} from "../services/job.service";

export const useGetJobs = (filters: any = {}) => {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => getJobs(filters),
  });
};

export const useGetJobDetailsById = (jobId: string) => {
  return useQuery({
    queryKey: ["job-details", jobId],
    queryFn: () => getJobDetailsById(jobId),
  });
};

export const useGetRelatedJobsById = (jobId: string) => {
  return useQuery({
    queryKey: ["related-jobs", jobId],
    queryFn: () => getRelatedJobsById(jobId),
  });
};
