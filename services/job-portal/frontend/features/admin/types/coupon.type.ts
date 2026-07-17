import { Coupon, Pagination } from "@/types";

export type GetAllCouponsResponse = {
  coupons: Coupon;
  pagination: Pagination;
};

export type UpdateCouponResponse = {
  coupon: Coupon;
};
