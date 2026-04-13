import apiClient, { ApiSuccessResponse } from "@/lib/api-client";

interface GetKycApplicationsParams { page: number; limit: number; status?: string };

interface GetKycApplicationsResponse {
    count: number;
    applications: any[];
    pagination: {
        totalPages: number;
        currentPage: number;
        limit: number;
        hasNextPage: number,
        hasPrevPage: number,
    },
}

interface UpdateKycApplicationStatusParams {
    applicationId: string;
    status: string;
    note?: string;
}

interface UpdateKycApplicationStatusResponse {
    kycApplication: any;
}

export const getKycApplications = async ({ page, limit, status }: GetKycApplicationsParams) => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (status) {
        params.append("status", status);
    }

    const response = await apiClient.get<ApiSuccessResponse<GetKycApplicationsResponse>>(`/admin/kyc-applications?${params.toString()}`);
    return response.data;
}

export const updateKycApplicationStatus = async ({ applicationId, status, note }: UpdateKycApplicationStatusParams) => {
    const response = await apiClient.put<ApiSuccessResponse<UpdateKycApplicationStatusResponse>>(
        `/admin/kyc-applications/${applicationId}/status`,
        { status }
    );
    return response.data;
}