import { useQuery } from "@tanstack/react-query";
import { blogService } from "../services/blog-service";

export const useGetMyBlogs = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["blogs", "my", params],
    queryFn: () => blogService.getMyBlogs(params),
  });
};
