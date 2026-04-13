import { useMutation } from "@tanstack/react-query";
import { blogService } from "../services/blog-service";

export const useCreateBlog = () => {
  return useMutation({
    mutationFn: blogService.createBlog,
  });
};
