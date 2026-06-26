import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService } from "../services/blog-service";

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blogService.updateBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
  });
};
