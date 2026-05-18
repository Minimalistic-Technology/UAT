import { useQuery } from "@tanstack/react-query";
import { blogService } from "../services/blog-service";

export const useGetUserStats = () => {
    return useQuery({
        queryKey: ["user-stats"],
        queryFn: () => blogService.getUserStats(),
        staleTime: 60 * 1000, // Cache for 1 min
    });
};
