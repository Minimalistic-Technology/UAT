import { useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminServices } from "../super-admin.services";
import { toast } from "sonner";
import { CouponFormValues } from "../super-admin.schema";
import { useRouter } from "next/navigation";

export const useCreateCoupon = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CouponFormValues) => {
      return superAdminServices.createCoupon(data);
    },
    onSuccess: () => {
      toast.success("Coupon created successfully!");
      // If we ever add a coupons list hook, invalidate it here
      // queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      router.push("/admin-dashboard");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create coupon. Please try again."
      );
    },
  });
};
