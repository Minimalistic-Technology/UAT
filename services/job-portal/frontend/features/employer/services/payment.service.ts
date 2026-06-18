import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { RazorpayOrder } from "../types";

export interface CreateOrderResponse {
  order: RazorpayOrder;
  paymentId: string;
  isFree?: boolean;
  finalAmount?: number;
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

export const verifyPayment = async (verificationPayload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const response = await apiClient.post<
    ApiSuccessResponse<{ success: boolean }>
  >("/payments/verify-payment", verificationPayload);

  return response.data;
};
