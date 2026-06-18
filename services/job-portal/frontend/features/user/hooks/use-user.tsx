import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getUserById,
  updateProfile,
  uploadResume,
} from "../services/user.service";

export const useGetUserDetails = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId as string),
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update profile";
      toast.error(message);
    },
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadResume,
    onSuccess: () => {
      toast.success("Resume uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Failed to upload resume. Make sure it's a PDF under 5MB.";
      toast.error(message);
    },
  });
};
