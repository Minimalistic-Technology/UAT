import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { RazorpayOrder } from "../types";

export interface CreateOrderResponse {
  order: RazorpayOrder;
  paymentId: string;
}

export const createOrder = async (orderPayload: {
  planId: string;
  userId: string;
  couponCode: string | null;
  internalOrderId: string;
}) => {
  const response = await apiClient.post<ApiSuccessResponse<CreateOrderResponse>>(
    "/payments/create-order",
    orderPayload
  );

  return response.data;
};