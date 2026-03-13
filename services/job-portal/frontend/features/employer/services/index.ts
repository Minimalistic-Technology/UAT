import apiClient, { ApiResponse } from "@/lib/axios";
import { EmployerRegisterInput } from "../schemas";
import { GlobalRole } from "@/types";
import { KYCSubmissionResponse } from "../types";
interface AuthenticatedUser {
  firstName: string;
  lastName: string;
  email: string;
  role: GlobalRole.USER;
}

export interface EmployerRegisterResponse extends ApiResponse<null> {
  token: string;
  user: AuthenticatedUser;
}

export const registerEmployer = async (
  data: EmployerRegisterInput,
): Promise<EmployerRegisterResponse> => {
  const response = await apiClient.post<EmployerRegisterResponse>(
    "/auth/employer/register",
    data,
  );
  return response.data;
};

export const submitKyc = async (
  data: FormData,
): Promise<ApiResponse<KYCSubmissionResponse>> => {
  const response = await apiClient.post<ApiResponse<KYCSubmissionResponse>>(
    "/users/kyc",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};
