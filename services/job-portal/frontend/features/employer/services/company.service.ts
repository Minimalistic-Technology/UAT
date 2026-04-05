import apiClient, { ApiSuccessResponse } from "@/lib/api-client"
import { Company } from "@/types"

interface GetMyCompanyResponse extends Omit<Company, "owner"> {
    owner: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface GetAllEmployeesResponse {
    count: number;
    employees: any[]
}

// Changes needed in the response types (backend has some issues, fix that and then update these types accordingly)
export const getMyCompany = async () => {
    const response = await apiClient.get<ApiSuccessResponse<GetMyCompanyResponse>>("/companies/me");
    return response.data;
}

export const getAllEmployees = async () => {
    const response = await apiClient.get<ApiSuccessResponse<GetAllEmployeesResponse>>("/company-members/all");
    return response.data;
}

export const deleteEmployee = async (id: string) => {
    const response = await apiClient.delete<ApiSuccessResponse<null>>(`/company-members/${id}`);
    return response.data;
}