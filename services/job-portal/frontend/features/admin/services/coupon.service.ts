import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { CouponFormValues } from "../validations/coupon.schema";
import {
  GetAllCouponsResponse,
  UpdateCouponResponse,
} from "../types/coupon.type";

export async function createCoupon(payload: CouponFormValues) {
  const response = await apiClient.post<ApiSuccessResponse<null>>(
    "/coupons",
    payload,
  );
  return response.data;
}

export const getAdminCoupons = async (page: number = 1, limit: number = 10) => {
  const response = await apiClient.get<
    ApiSuccessResponse<GetAllCouponsResponse>
  >(`/coupons`, {
    params: { page, limit },
  });
  return response.data;
};

export const updateCoupon = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<CouponFormValues>;
}) => {
  const response = await apiClient.put<
    ApiSuccessResponse<UpdateCouponResponse>
  >(`/coupons/${id}`, data);
  return response.data;
};

export const deleteCoupon = async (id: string) => {
  const response = await apiClient.delete<ApiSuccessResponse<null>>(
    `/coupons/${id}`,
  );
  return response.data;
};
