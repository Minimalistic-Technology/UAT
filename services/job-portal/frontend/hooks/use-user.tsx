import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile, UpdateProfilePayload } from "@/services/user.service";
import { toast } from "sonner";

export const useGetUserDetails = (enabled: boolean = true) => {
  const response = useQuery({
    queryKey: ["user-details"],
    queryFn: async () => {
      const response = await apiClient.get<ApiSuccessResponse<any>>("/auth/me");
      return response.data;
    },
    enabled,
  });

  return response;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => updateProfile(data),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-details"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });
};
