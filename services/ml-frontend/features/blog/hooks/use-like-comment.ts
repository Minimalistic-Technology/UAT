import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService } from "../services/blog-service";
import { toast } from "sonner";

export const useLikeComment = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => blogService.likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to like comment");
    },
  });
};
