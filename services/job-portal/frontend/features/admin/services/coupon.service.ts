import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { API_URL } from "@/constants";
import { GET_ADMIN_COUPONS_QUERY } from "../graphql/queries/coupon.queries";
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
  const response = await apiClient.post(
    "/graphql",
    {
      query: GET_ADMIN_COUPONS_QUERY,
      variables: { page, limit },
    },
    {
      baseURL: API_URL.replace("/api", ""),
    }
  );

  return {
    success: true,
    statusCode: 200,
    message: "Coupons fetched successfully",
    data: response.data.data.getCoupons,
  };
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
