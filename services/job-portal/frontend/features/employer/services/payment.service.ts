import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { CashfreeOrder } from "../types";

export interface CreateOrderResponse {
  order: CashfreeOrder;
  paymentSessionId?: string;
  isFree?: boolean;
  finalAmount?: number;
  discountValue?: number;
  couponApplied?: boolean;
}

export interface VerifyPaymentResponse {
  orderId: string;
  orderStatus: string;
  paymentStatus: "CREATED" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "REFUNDED";
}

export const createOrder = async (orderPayload: {
  planId: string;
  userId: string;
  couponCode: string | null;
  internalOrderId: string;
  billingCycle?: "monthly" | "yearly" | string;
}) => {
  const response = await apiClient.post<
    ApiSuccessResponse<CreateOrderResponse>
  >("/payments/create-order", orderPayload);

  return response.data;
};

export const verifyCashfreePayment = async (orderId: string) => {
  const response = await apiClient.get<
    ApiSuccessResponse<VerifyPaymentResponse>
  >(`/payments/${encodeURIComponent(orderId)}/verify`);

  return response.data;
};

export const getMyPayments = async () => {
  const response = await apiClient.get<ApiSuccessResponse<any[]>>(
    "/payments/my-payments",
  );
  return response.data;
};
