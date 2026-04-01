import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { type CouponResponse } from "@/features/employer/types";
import { applyCoupon } from "@/features/employer/services";

export function useCoupon() {
  const [couponData, setCouponData] = useState<CouponResponse | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (variables: { code: string; planId: string }) => 
      applyCoupon(variables.code, variables.planId),
    onSuccess: (response) => {
      setCouponData(response.data);
      setCouponError(null);
    },
    onError: (error: any) => {
      setCouponError(error?.response?.data?.message || "Invalid coupon code");
      setCouponData(null);
    },
  });

  const handleApply = (code: string, planId: string = "ALL") => {
    if (!code) return;
    mutation.mutate({ code, planId });
  };

  const handleRemove = () => {
    setCouponData(null);
    setCouponError(null);
    mutation.reset();
  };

  return {
    couponData,
    couponError,
    isLoading: mutation.isPending,
    handleApply,
    handleRemove,
    appliedCode: couponData?.coupon?.code || null,
  };
}