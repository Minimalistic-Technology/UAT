import apiClient, { ApiResponse } from "@/lib/axios";
import { RegisterUserInput } from "./auth.schema";
import { AuthUser } from "./auth.types";

export interface ConfirmRegistrationInput {
  email: string;
  otp: string;
}

export const registerUser = async (
  data: RegisterUserInput
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>("/auth/request-otp/register", data);
  return response.data;
};

export const confirmRegistration = async (
  data: ConfirmRegistrationInput
): Promise<ApiResponse<AuthUser>> => {
  const response = await apiClient.post<ApiResponse<AuthUser>>("/auth/register/confirm", data);
  return response.data;
};
