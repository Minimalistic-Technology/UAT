import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyJob,
  getMyApplications,
  getMyApplicationStats,
  ApplyJobPayload,
  getApplicationById,
} from "../services/job-application.service";
import { ApiError, ApiSuccessResponse } from "@/lib/api-client";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { getValidationErrorMessage } from "@/lib/validation-error";
import { useRouter } from "next/navigation";

export const useGetMyApplications = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["my-applications", params],
    queryFn: () => getMyApplications(params),
  });
};

export const useGetMyApplicationStats = () => {
  return useQuery({
    queryKey: ["my-application-stats"],
    queryFn: () => getMyApplicationStats(),
  });
};

export const useGetApplicationById = (id: string) => {
  return useQuery({
    queryKey: ["application", id],
    queryFn: () => getApplicationById(id),
    enabled: !!id,
  });
};

export const useApplyJob = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<
    ApiSuccessResponse<any>,
    AxiosError<ApiError>,
    ApplyJobPayload
  >({
    mutationFn: (data: ApplyJobPayload) => applyJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      router.push("/user-dashboard");
      toast.success("Job applied successfully");
    },
    onError: (error) => {
      console.error("Error applying for job", error);
      const message =
        error.response?.data?.message || "Failed to apply for job";

      if (message === "Validation failed") {
        const errorMessage = getValidationErrorMessage(
          error.response?.data.errors,
        );
        toast.error(errorMessage);
      } else {
        toast.error(message);
      }
    },
  });
};
