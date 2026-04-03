import { useQuery } from "@tanstack/react-query";
import { blogService } from "../services/blog-service";

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => blogService.getComments(postId),
    enabled: !!postId,
  });
};
