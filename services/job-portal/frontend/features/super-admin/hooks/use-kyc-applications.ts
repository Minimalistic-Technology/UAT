import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminServices } from "../super-admin.services";
import { toast } from "sonner";

export const useKycApplications = (
  page: number = 1,
  limit: number = 10,
  status?: string
) => {
  return useQuery({
    queryKey: ["admin-kyc-applications", page, limit, status],
    queryFn: () => superAdminServices.getKycApplications(page, limit, status),
  });
};

export const useUpdateKycStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: superAdminServices.updateKycApplicationStatus,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-applications"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Failed to update KYC status. Please try again.";
      toast.error(message);
    },
  });
};
