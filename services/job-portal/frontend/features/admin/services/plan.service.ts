import apiClient, { ApiSuccessResponse } from "@/lib/api-client"
import { CreatePlanFormValues } from "../validations/plan.schema"

export const createPlan = async (data: CreatePlanFormValues) => {
    const response = await apiClient.post<ApiSuccessResponse<any>>("/plans", data);
    return response.data;
}

export const getAdminPlans = async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get<ApiSuccessResponse<any>>(`/plans/admin`, {
        params: { page, limit }
    });
    return response.data;
}

export const updatePlan = async ({ id, data }: { id: string, data: Partial<CreatePlanFormValues> }) => {
    const response = await apiClient.put<ApiSuccessResponse<any>>(`/plans/${id}`, data);
    return response.data;
}

export const deletePlan = async (id: string) => {
    const response = await apiClient.delete<ApiSuccessResponse<any>>(`/plans/${id}`);
    return response.data;
}