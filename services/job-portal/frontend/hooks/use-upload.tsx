import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiClient.put("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Profile picture updated!");
      queryClient.invalidateQueries({ queryKey: ["user-details"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to upload image");
    },
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await apiClient.put("/users/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Resume uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-details"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to upload resume");
    },
  });
};