import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { Company } from "@/types/new-index";
import { GetMyCompanyResponse } from "../types/company.type";

interface GetAllEmployeesResponse {
  count: number;
  members: any[];
}

interface SubmitKycResponse {
  companyName: string;
  aadharNo: string;
  gstNo: string;
  cinNo: string;
  documents: {
    photoUrl: string;
    lightbillUrl: string;
  };
}

// Changes needed in the response types (backend has some issues, fix that and then update these types accordingly)
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
