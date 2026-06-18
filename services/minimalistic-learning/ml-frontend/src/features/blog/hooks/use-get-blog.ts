import { useQuery } from "@tanstack/react-query";
import { blogService } from "../services/blog-service";

export const useGetBlog = (id: string) => {
  return useQuery({
    queryKey: ["blog", id],
    queryFn: () => blogService.getBlogById(id),
    enabled: !!id,
  });
};
