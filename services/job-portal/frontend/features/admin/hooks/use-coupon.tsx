import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCoupon, getAdminCoupons, updateCoupon, deleteCoupon } from "../services/coupon.service";
import { toast } from "sonner";
import { CouponFormValues } from "../validations/coupon.schema";
import { useRouter } from "next/navigation";

export const useCreateCoupon = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CouponFormValues) => {
      return createCoupon(data);
    },
    onSuccess: () => {
      toast.success("Coupon created successfully!");
      // If we ever add a coupons list hook, invalidate it here
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      router.push("/admin-dashboard");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create coupon. Please try again."
      );
    },
  });
};

export const useFetchAdminCoupons = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["admin-coupons", page, limit],
    queryFn: () => getAdminCoupons(page, limit),
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; data: Partial<CouponFormValues> }) => updateCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon updated successfully");
    },
    onError: (error: any) => {
      console.error("Failed to update coupon", error);
      toast.error(error.response?.data?.message || "Failed to update coupon. Please try again.");
    }
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon deleted successfully");
    },
    onError: (error: any) => {
      console.error("Failed to delete coupon", error);
      toast.error(error.response?.data?.message || "Failed to delete coupon. Please try again.");
    }
  });
};
