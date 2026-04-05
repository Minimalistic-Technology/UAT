import { useQuery } from "@tanstack/react-query";
import { getJobs } from "../services/job.service";

export const useGetJobs = (filters: any = {}) => {
    return useQuery({
        queryKey: ["jobs", filters],
        queryFn: () => getJobs(filters),
    });
}