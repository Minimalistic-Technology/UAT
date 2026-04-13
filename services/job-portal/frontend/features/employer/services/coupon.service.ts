import apiClient, { type ApiSuccessResponse } from "@/lib/api-client";
import { Coupon } from "../types";

interface ValidateCouponResponse {
    coupon: Coupon,
    baseAmount: number,
    discountValue: number,
    finalPrice: number
}

export const validateCoupon = async (code: string, baseAmount: number): Promise<ApiSuccessResponse<ValidateCouponResponse>> => {
    const response = await apiClient.post<ApiSuccessResponse<ValidateCouponResponse>>("/coupons/validate", {
        code,
        baseAmount
    });
    return response.data
}