import apiClient, { ApiResponse } from "@/lib/axios";
import { EmployerRegisterInput } from "../schemas";
import { GlobalRole } from "@/types";
import { CouponResponse, KYCSubmissionResponse, OrderResponse, Plan } from "../types";

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

export const getPlans = async () => {
  const response =
    await apiClient.get<ApiResponse<{ count: number; plans: Plan[] }>>(
      "/plans",
    );
  return response.data;
};

export const applyCoupon = async (code: string, planId: string) => {
  const response = await apiClient.post<ApiResponse<CouponResponse>>(
    "/coupons/apply",
    { code, planId },
  );
  return response.data;
};

export const createOrder = async (orderPayload: {
  amount: number;
  planId: string;
  userId: string;
  internalOrderId: string;
}) => {
  const response = await apiClient.post(
    "/payments/create-order",
    orderPayload
  );

  return response.data;
};
