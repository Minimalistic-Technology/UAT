import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { CreatePlanFormValues } from "../validations/plan.schema";
import { CreatePlan, GetAllAdminPlans, UpdatePlan } from "../types/plan.type";

export const createPlan = async (data: CreatePlanFormValues) => {
  const response = await apiClient.post<ApiSuccessResponse<CreatePlan>>(
    "/plans",
    data,
  );
  return response.data;
};

export const getAdminPlans = async (page: number = 1, limit: number = 10) => {
  const response = await apiClient.get<ApiSuccessResponse<GetAllAdminPlans>>(
    `/plans/admin`,
    {
      params: { page, limit },
    },
  );
  return response.data;
};

export const updatePlan = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<CreatePlanFormValues>;
}) => {
  const response = await apiClient.put<ApiSuccessResponse<UpdatePlan>>(
    `/plans/${id}`,
    data,
  );
  return response.data;
};

export const deletePlan = async (id: string) => {
  const response = await apiClient.delete<ApiSuccessResponse<null>>(
    `/plans/${id}`,
  );
  return response.data;
};
