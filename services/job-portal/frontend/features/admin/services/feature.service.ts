import apiClient, { ApiSuccessResponse } from "@/lib/api-client";

export interface FeatureCheckResponse {
  allowed: boolean;
}

export const checkFeature = async (
  slug: string,
): Promise<FeatureCheckResponse> => {
  const response = await apiClient.get<
    ApiSuccessResponse<FeatureCheckResponse>
  >(`/features/${slug}/check`);

  return response.data.data;
};
