import { Coupon, Pagination } from "@/types/new-index"

export type GetAllCouponsResponse = {
    coupons: Coupon,
    pagination: Pagination
}

export type UpdateCouponResponse = {
    coupon: Coupon;
}