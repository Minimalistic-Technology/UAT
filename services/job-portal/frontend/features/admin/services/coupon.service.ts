import apiClient, { ApiSuccessResponse } from "@/lib/api-client";
import { CouponFormValues } from "../validations/coupon.schema";

export async function createCoupon(payload: CouponFormValues) {
    const response = await apiClient.post<ApiSuccessResponse<null>>("/coupons", payload);
    return response.data;
}

export const getAdminCoupons = async (page: number = 1, limit: number = 10) => {
    // Assuming backend will have /coupons/admin or we just use /coupons
    const response = await apiClient.get<ApiSuccessResponse<any>>(`/coupons`, {
        params: { page, limit }
    });
    return response.data;
}

export const updateCoupon = async ({ id, data }: { id: string, data: Partial<CouponFormValues> }) => {
    const response = await apiClient.put<ApiSuccessResponse<any>>(`/coupons/${id}`, data);
    return response.data;
}

export const deleteCoupon = async (id: string) => {
    const response = await apiClient.delete<ApiSuccessResponse<any>>(`/coupons/${id}`);
    return response.data;
}