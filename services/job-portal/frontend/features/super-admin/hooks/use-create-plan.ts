import { useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminServices } from "../super-admin.services";
import { toast } from "sonner";
import { PlanFormValues } from "../super-admin.schema";
import { useRouter } from "next/navigation";

export const useCreatePlan = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlanFormValues) => {
      console.log("payload again", data);
      return superAdminServices.createPlan(data);
    },
    onSuccess: () => {
      toast.success("Plan created successfully!");
      // If we ever add a plans list hook, we invalidate it here:
      // queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      router.push("/admin-dashboard");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create plan. Please try again."
      );
    },
  });
};
