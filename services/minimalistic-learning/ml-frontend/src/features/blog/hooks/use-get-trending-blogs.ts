import { useQuery } from "@tanstack/react-query";
import { blogService } from "../services/blog-service";

export const useGetTrendingBlogs = () => {
  return useQuery({
    queryKey: ["trending-blogs"],
    queryFn: () => blogService.getTrendingBlogs(),
  });
};
