import apiClient, { type ApiSuccessResponse } from "@/lib/api-client";
import { API_URL } from "@/constants";
import { Plan } from "../types";
import { GET_ACTIVE_PLANS_QUERY } from "../graphql/queries/plan.queries";

interface GetPlansResponse {
  count: number;
  plans: Plan[];
}

export const getPlans = async (): Promise<
  ApiSuccessResponse<GetPlansResponse>
> => {
  const response = await apiClient.post(
    "/graphql",
    {
      query: GET_ACTIVE_PLANS_QUERY,
    },
    {
      baseURL: API_URL.replace("/api", ""),
    },
  );
  // Mimic the original ApiSuccessResponse shape
  return {
    success: true,
    data: response.data.data.getPlans,
    message: "Active plans fetched successfully",
  } as ApiSuccessResponse<GetPlansResponse>;
};
