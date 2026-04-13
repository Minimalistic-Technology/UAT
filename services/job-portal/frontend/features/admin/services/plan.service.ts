import apiClient, { ApiSuccessResponse } from "@/lib/api-client"
import { CreatePlanFormValues } from "../validations/plan.schema"

export const createPlan = async (data: CreatePlanFormValues) => {
    const response = await apiClient.post<ApiSuccessResponse<any>>("/plans", data);
    return response.data;
}