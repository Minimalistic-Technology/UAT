import apiClient, { ApiResponse } from "@/lib/axios";
import { RegisterUserInput } from "./auth.schema";
import { AuthUser } from "./auth.types";

export interface RegisterResponse extends ApiResponse<null> {
  token: string;
  user: AuthUser;
}

export const registerUser = async (
  data: RegisterUserInput
): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>("/auth/register", data);
  return response.data;
};
