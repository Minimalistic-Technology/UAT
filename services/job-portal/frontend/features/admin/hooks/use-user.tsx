import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllUsers, toggleUserStatus } from "../services/user.service";
import { toast } from "sonner";

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      toggleUserStatus(userId, isActive),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated");
    },

    onError: () => {
      toast.error("Failed to update user");
    },
  });
};

export const useFetchAllUsers = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["admin-users", page, limit],
    queryFn: async () => {
      const data = await fetchAllUsers({ page, limit });
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
};
