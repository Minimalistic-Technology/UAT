import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import {
  GetKycApplicationsParams,
  GetKycApplicationsResponse,
  UpdateKycApplicationStatusParams,
  UpdateKycApplicationStatusResponse,
} from "../types/kyc.type";

export const getKycApplications = async ({
  page,
  limit,
  status,
}: GetKycApplicationsParams) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) {
    params.append("status", status);
  }

  const response = await apiClient.get<
    ApiSuccessResponse<GetKycApplicationsResponse>
  >(`/admin/kyc-applications?${params.toString()}`);
  return response.data;
};

export const updateKycApplicationStatus = async ({
  applicationId,
  status,
  note,
}: UpdateKycApplicationStatusParams) => {
  const response = await apiClient.put<
    ApiSuccessResponse<UpdateKycApplicationStatusResponse>
  >(`/admin/kyc-applications/${applicationId}/status`, { status, note });
  return response.data;
};
