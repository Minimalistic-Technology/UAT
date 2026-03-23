import { apiClient } from "@/lib/api";
import { IPaginatedKycApplications, IKycApplication } from "./super-admin.types";
import { PlanFormValues } from "./super-admin.schema";

export const superAdminServices = {
  getKycApplications: async (
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<IPaginatedKycApplications> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append("status", status);
    }

    const res = await apiClient.get<IPaginatedKycApplications>(`/admin/kyc-applications?${params.toString()}`);
    return res;
  },

  updateKycApplicationStatus: async ({
    applicationId,
    status,
  }: {
    applicationId: string;
    status: "approved" | "rejected";
  }): Promise<{ success: boolean; message: string; data: IKycApplication }> => {
    const res = await apiClient.put<{ success: boolean; message: string; data: IKycApplication }>(
      `/admin/kyc-applications/${applicationId}/status`, 
      { status }
    );
    return res;
  },

  createPlan: async (payload: PlanFormValues): Promise<{ success: boolean; data: any }> => {
    const res = await apiClient.post<{ success: boolean; data: any }>("/plans", payload);
    return res;
  },
};