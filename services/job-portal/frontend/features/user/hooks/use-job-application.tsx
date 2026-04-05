import { useQuery } from "@tanstack/react-query";
import { getMyApplications } from "../services/job-application.service";

export const useGetMyApplications = () => {
    return useQuery({
        queryKey: ["my-applications"],
        queryFn: () => getMyApplications(),
    });
}