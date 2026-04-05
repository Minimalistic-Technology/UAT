"use client";

import { useSession } from "next-auth/react";
import {
  Briefcase,
  Check,
  Clock,
  Infinity,
  Star,
  Zap,
  AlertCircle,
  Tag,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  formatCurrency,
  formatJobLimit,
  formatDuration,
} from "@/features/employer/helper/plan.helper";
import { loadRazorpayScript } from "@/lib/razorpay-script";
import { createOrder } from "@/features/employer/services/payment.service";
import type { Plan } from "../types";
import { useState } from "react";
import { useValidateCoupon } from "../hooks/use-coupons";

export function PlanCard({ plan }: { plan: Plan }) {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const isUnlimited = plan.jobPostLimit === -1;

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateMutation = useValidateCoupon();

  function handleValidateCoupon() {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    setIsValidating(true);

    try {
      validateMutation.mutate(
        {
          code: couponCode,
          baseAmount: plan.price,
        },
        {
          onSuccess: (response) => {
            setAppliedCoupon(response.data.coupon);
            setDiscountedPrice(response.data.finalPrice);
          },
          onError: (error: any) => {
            setAppliedCoupon(null);
            setDiscountedPrice(null);
            const msg = error?.response?.data?.message || "Invalid or expired coupon";
            toast.error(msg);
          },
        },
      );
    } catch (error) {
      console.error("Unexpected error during coupon validation:", error);
      toast.error("An unexpected error occurred while validating the coupon.");
    } finally {
      setIsValidating(false);
    }
  }

  // Helper to remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountedPrice(null);
    setCouponCode("");
  };

  const handlePayment = async () => {
    const isLoaded = await loadRazorpayScript();

    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load.");
      return;
    }

    try {
      const payload = {
        planId: plan._id,
        userId: userId!,
        couponCode: appliedCoupon?.code,
        internalOrderId: `ORD_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };

      const orderData = await createOrder(payload);
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.data.order.amount,
        currency: orderData.data.order.currency,
        name: "Job Portal",
        description: `Upgrade to ${plan.name} Plan`,
        order_id: orderData.data.order.id,
        handler: function (response: any) {
          window.location.href = `/employer/dashboard?payment=success&orderId=${orderData.data.order.id}`;
        },
        prefill: {
          name: session?.user?.name || "Employer",
          email: session?.user?.email || "",
        },
        theme: {
          color: plan.isFeatured ? "#7c3aed" : "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initialize payment.");
    }
  };

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col border-2 transition-all duration-300",
        plan.isFeatured
          ? "border-primary shadow-primary/10 z-10 scale-[1.02] shadow-xl"
          : "border-border hover:shadow-lg",
      )}
    >
      <div className="absolute top-0 right-0 flex">
        {plan.isFeatured && (
          <Badge className="bg-primary text-primary-foreground rounded-none rounded-bl-lg px-3 py-1 font-bold">
            <Star className="mr-1 h-3 w-3 fill-current" />
            Most Popular
          </Badge>
        )}
      </div>

      {plan.isDefault && (
        <div className="absolute top-0 left-0">
          <Badge
            variant="secondary"
            className="rounded-none rounded-br-lg px-3 py-1 font-semibold"
          >
            Current Default
          </Badge>
        </div>
      )}

      <CardHeader
        className={cn(
          "px-6 pt-10 pb-6",
          plan.isFeatured ? "bg-primary/5" : "bg-muted/30",
        )}
      >
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{plan.name}</h2>
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {plan.description || "Tailored hiring solutions for your business."}
          </p>
        </div>

        <div className="mt-6 flex items-baseline gap-1">
          <span className="text-4xl font-black">
            {formatCurrency(plan.price, plan.currency)}
          </span>
          <span className="text-muted-foreground text-sm font-medium">
            /{formatDuration(plan.durationDays)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-background flex gap-1.5 px-2.5 py-1">
            <Briefcase className="text-primary h-3.5 w-3.5" />
            {formatJobLimit(plan.jobPostLimit)}
          </Badge>
          <Badge variant="outline" className="bg-background flex gap-1.5 px-2.5 py-1">
            {isUnlimited ? (
              <Infinity className="text-primary h-3.5 w-3.5" />
            ) : (
              <Clock className="text-primary h-3.5 w-3.5" />
            )}
            {formatDuration(plan.durationDays)} Validity
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-6 pt-6">
        {/* Price Section */}
        <div className="mb-4">
          {discountedPrice !== null ? (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm line-through">
                {formatCurrency(plan.price, plan.currency)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(discountedPrice, plan.currency)}
                </span>
                <Badge variant="outline" className="text-green-600 border-green-600 text-[10px] uppercase">
                   Save {(plan.price - discountedPrice).toFixed(2)} {plan.currency}
                </Badge>
              </div>
            </div>
          ) : (
            <span className="text-2xl font-bold">
              {formatCurrency(plan.price, plan.currency)}
            </span>
          )}
        </div>

        {/* Coupon Input & Applied State */}
        <div className="mb-6 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Coupon Code"
              className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm uppercase shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={!!appliedCoupon}
            />
            {!appliedCoupon ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleValidateCoupon}
                disabled={isValidating || !couponCode}
              >
                Apply
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeCoupon}
                className="text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {appliedCoupon && (
            <div className="flex items-center gap-2 text-xs font-medium text-green-600 animate-in fade-in slide-in-from-top-1">
              <Tag className="h-3 w-3" />
              <span>Coupon "{appliedCoupon.code}" Applied</span>
            </div>
          )}
        </div>

        <ul className="space-y-3">
          {plan.features.length > 0 ? (
            plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="bg-primary/10 mt-1 rounded-full p-0.5">
                  <Check className="text-primary h-3.5 w-3.5" strokeWidth={3} />
                </div>
                <span className="text-foreground/80 text-sm leading-snug">
                  {feature}
                </span>
              </li>
            ))
          ) : (
            <li className="text-muted-foreground flex items-center gap-2 text-sm italic">
              <AlertCircle className="h-4 w-4" />
              Standard features included
            </li>
          )}
        </ul>
      </CardContent>

      <CardFooter className="px-6 pb-8">
        <Button
          onClick={handlePayment}
          size="lg"
          className={cn(
            "group w-full cursor-pointer font-bold transition-all active:scale-95",
            plan.isFeatured ? "shadow-primary/20 shadow-lg" : "",
          )}
          variant={plan.isFeatured ? "default" : "outline"}
        >
          <Zap
            className={cn(
              "mr-2 h-4 w-4 transition-transform group-hover:scale-110",
              plan.isFeatured ? "fill-current" : "text-primary",
            )}
          />
          Get {plan.name}
        </Button>
      </CardFooter>
    </Card>
  );
}