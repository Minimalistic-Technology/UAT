import apiClient, { type ApiSuccessResponse } from "@/lib/api-client";
import { RegisterUserInput } from "../validations/auth.schema";
import { AuthUser } from "../types";;

export interface ConfirmRegistrationInput {
  email: string;
  otp: string;
}

export const registerUser = async (
  data: RegisterUserInput,
): Promise<ApiSuccessResponse<null>> => {
  const response = await apiClient.post<ApiSuccessResponse<null>>(
    "/auth/request-otp/register",
    data,
  );
  return response.data;
};

export const confirmRegistration = async (
  data: ConfirmRegistrationInput,
): Promise<ApiSuccessResponse<AuthUser>> => {
  const response = await apiClient.post<ApiSuccessResponse<AuthUser>>(
    "/auth/register/confirm",
    data,
  );
  return response.data;
};
