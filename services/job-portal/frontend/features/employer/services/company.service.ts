import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { Company } from "@/types";
import { CompanyDashboardDetails } from "../types/company.type";
import { GetMyCompanyResponse } from "../types/company.type";
import { API_URL } from "@/constants";
import { GET_MY_COMPANY_DASHBOARD_DETAILS_QUERY } from "../graphql/queries/company.queries";

interface GetAllEmployeesResponse {
  count: number;
  members: any[];
}

interface SubmitKycResponse {
  companyDocumentType: string;
  personalDocumentType: string;
  documents: {
    personalDocumentUrl: string;
    companyDocumentUrl: string;
  };
}

export const getMyCompany = async () => {
  const response =
    await apiClient.get<ApiSuccessResponse<GetMyCompanyResponse>>(
      "/companies/me",
    );
  return response.data;
};

export const getAllEmployees = async () => {
  const response = await apiClient.get<
    ApiSuccessResponse<GetAllEmployeesResponse>
  >("/company-members/all");
  return response.data;
};

export const deleteEmployee = async (id: string) => {
  const response = await apiClient.delete<ApiSuccessResponse<null>>(
    `/company-members/${id}`,
  );
  return response.data;
};

export const getEmployeeById = async (id: string) => {
  const response = await apiClient.get<ApiSuccessResponse<any>>(
    `/company-members/${id}`,
  );
  return response.data;
};

export const updateEmployee = async ({
  id,
  data,
}: {
  id: string;
  data: any;
}) => {
  const response = await apiClient.patch<ApiSuccessResponse<any>>(
    `/company-members/${id}`,
    data,
  );
  return response.data;
};

export const addEmployee = async (data: any) => {
  const response = await apiClient.post<ApiSuccessResponse<any>>(
    "/company-members",
    data,
  );
  return response.data;
};

export const submitKycData = async (formData: FormData) => {
  const response = await apiClient.post<ApiSuccessResponse<SubmitKycResponse>>(
    "/users/kyc",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const updateCompanyDetails = async (data: Partial<Company>) => {
  const response = await apiClient.put<ApiSuccessResponse<Company>>(
    "/companies/me",
    data,
  );
  return response.data;
};

export const uploadCompanyLogo = async (formData: FormData) => {
  const response = await apiClient.put<ApiSuccessResponse<{ logoUrl: string }>>(
    "/companies/logo",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const deleteCompany = async (id: string) => {
  const response = await apiClient.delete<ApiSuccessResponse<null>>(
    `/companies/${id}`,
  );
  return response.data;
};

export const getMyCompanyDashboardDetails = async (): Promise<
  ApiSuccessResponse<CompanyDashboardDetails>
> => {
  const response = await apiClient.post(
    "/graphql",
    {
      query: GET_MY_COMPANY_DASHBOARD_DETAILS_QUERY,
    },
    {
      baseURL: API_URL.replace("/api", ""),
    },
  );
  return {
    success: true,
    data: response.data.data.getMyCompanyDashboardDetails,
    message: "Dashboard details fetched successfully",
  } as ApiSuccessResponse<CompanyDashboardDetails>;
};
