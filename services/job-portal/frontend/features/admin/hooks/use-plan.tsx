import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPlan } from "../services/plan.service";
import { CreatePlanFormValues } from "../validations/plan.schema";
import { toast } from "sonner";

export const useCreatePlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePlanFormValues) => createPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plans"] });
            toast.success("Plan created successfully");
        },
        onError: (error) => {
            console.error("Failed to create plan", error);
            toast.error("Failed to create plan. Please try again.");
        }
    })
}