import { useMutation } from "@tanstack/react-query";
import { validateCoupon } from "../services/coupon.service";

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: ({ code, baseAmount }: { code: string; baseAmount: number }) =>
      validateCoupon(code, baseAmount),
  });
};
