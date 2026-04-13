import { useQuery } from "@tanstack/react-query";
import { getJobDetailsById, getJobs } from "../services/job.service";

export const useGetJobs = (filters: any = {}) => {
    return useQuery({
        queryKey: ["jobs", filters],
        queryFn: () => getJobs(filters),
    });
}

export const useGetJobDetailsById = (jobId: string) => {
    return useQuery({
        queryKey: ["job-details"],
        queryFn: () => getJobDetailsById(jobId)
    })
}