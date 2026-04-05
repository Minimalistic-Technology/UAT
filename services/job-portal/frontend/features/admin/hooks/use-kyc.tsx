import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getKycApplications,
  updateKycApplicationStatus,
} from "../services/kyc.service";

export const useGetKycApplications = ({
  page,
  limit,
  status,
}: {
  page: number;
  limit: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["kyc-applications", page, limit, status],
    queryFn: () => getKycApplications({ page, limit, status }),
  });
};

export const useUpdateKycApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, status, note }: { applicationId: string; status: string; note?: string }) =>
      updateKycApplicationStatus({ applicationId, status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-applications"] });
    },
  });
};
