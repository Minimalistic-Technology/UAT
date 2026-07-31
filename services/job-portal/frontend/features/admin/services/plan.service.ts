import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { API_URL } from "@/constants";
import { CreatePlanFormValues } from "../validations/plan.schema";
import { CreatePlan, GetAllAdminPlans, UpdatePlan } from "../types/plan.type";
import { GET_ALL_ADMIN_PLANS_QUERY } from "../graphql/queries/plan.queries";

export const createPlan = async (data: CreatePlanFormValues) => {
  const response = await apiClient.post<ApiSuccessResponse<CreatePlan>>(
    "/plans",
    data,
  );
  return response.data;
};

export const getAdminPlans = async (page: number = 1, limit: number = 10) => {
  const response = await apiClient.post(
    "/graphql",
    {
      query: GET_ALL_ADMIN_PLANS_QUERY,
      variables: { page, limit },
    },
    {
      baseURL: API_URL.replace("/api", ""),
    },
  );

  return {
    success: true,
    data: response.data.data.getAllAdminPlans,
    message: "All plans fetched successfully for admin",
  } as ApiSuccessResponse<GetAllAdminPlans>;
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
