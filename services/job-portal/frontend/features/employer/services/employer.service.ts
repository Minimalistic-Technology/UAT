import apiClient, { ApiResponse } from "@/lib/axios";
import { EmployerRegisterInput } from "../employer.schema";
import { GlobalRole } from "@/types";

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
