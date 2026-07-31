import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService } from "../services/blog-service";

export const useLikeBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogService.likePost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};
