import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPlan,
  getAdminPlans,
  updatePlan,
  deletePlan,
} from "../services/plan.service";
import { CreatePlanFormValues } from "../validations/plan.schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useCreatePlan = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreatePlanFormValues) => createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plan created successfully");
      if (onSuccessCallback) {
        onSuccessCallback();
      } else {
        router.push("/admin-dashboard/plans");
      }
    },
    onError: (error) => {
      console.error("Failed to create plan", error);
      toast.error("Failed to create plan. Please try again.");
    },
  });
};

export const useFetchAdminPlans = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["plans", "admin", page, limit],
    queryFn: () => getAdminPlans(page, limit),
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; data: Partial<CreatePlanFormValues> }) =>
      updatePlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plan updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update plan", error);
      toast.error("Failed to update plan. Please try again.");
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plan deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete plan", error);
      toast.error("Failed to delete plan. Please try again.");
    },
  });
};
