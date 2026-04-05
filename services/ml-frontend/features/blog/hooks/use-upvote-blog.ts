import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService } from "../services/blog-service";

export const useUpvoteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogService.upvotePost(id),
    onSuccess: (_, id) => {
      // Invalidate both by slug and ID if necessary, but usually just by slug and the list
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};

export const useDownvoteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogService.downvotePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};
