import apiClient, { type ApiSuccessResponse } from "@/lib/api-client";
import { Plan } from "../types";

interface GetPlansResponse {
    count: number;
    plans: Plan[]
}

export const getPlans = async (): Promise<ApiSuccessResponse<GetPlansResponse>> => {
    const response = await apiClient.get<ApiSuccessResponse<GetPlansResponse>>("/plans");
    return response.data
}