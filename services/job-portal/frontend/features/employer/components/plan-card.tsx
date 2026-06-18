"use client";

import { useSession } from "next-auth/react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Infinity,
  Zap,
  AlertCircle,
  Tag,
  X,
  CalendarDays,
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
import {
  createOrder,
  verifyPayment,
} from "@/features/employer/services/payment.service";
import type { Plan } from "../types";
import { useState } from "react";
import { useValidateCoupon } from "../hooks/use-coupons";
import { useGetMyCompanyDetails } from "../hooks/use-company";
import { useRouter } from "next/navigation";
import { APP_NAME } from "@/constants";

export function PlanCard({
  plan,
  isYearly = false,
}: {
  plan: Plan;
  isYearly?: boolean;
}) {
  const { data: session } = useSession();
  const companyRole = session?.user.companyRole;
  const userId = session?.user.id;
  const isUnlimited = plan.jobPostLimit === -1;
  const router = useRouter();

  const currentBasePrice = isYearly
    ? Math.round(plan.price * 12 * 0.8)
    : plan.price;

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateMutation = useValidateCoupon();
  const { data: companyResponse, isLoading: isCompanyLoading } =
    useGetMyCompanyDetails();
  const companyDetails = companyResponse?.data;
  const hasActivePlan = companyDetails?.subscription?.status === "active";
  const remainingJobPosts = companyDetails?.remainingJobPosts;
  const canPurchase =
    !isCompanyLoading && (!hasActivePlan || remainingJobPosts === 0);

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
          baseAmount: currentBasePrice,
        },
        {
          onSuccess: (response) => {
            setAppliedCoupon(response.data.coupon);
            setDiscountedPrice(response.data.finalPrice);
          },
          onError: (error: any) => {
            setAppliedCoupon(null);
            setDiscountedPrice(null);
            const msg =
              error?.response?.data?.message || "Invalid or expired coupon";
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

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountedPrice(null);
    setCouponCode("");
  };

  const handlePayment = async () => {
    if (companyRole !== "owner") {
      toast.error("Only owner can buy plans");
      return;
    }

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
        billingCycle: isYearly ? "yearly" : "monthly",
        internalOrderId: `ORD_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };

      const orderData = await createOrder(payload);

      if (orderData.data.isFree) {
        toast.success("Plan activated successfully!");
        router.push("/employer-dashboard");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.data.order.amount,
        currency: orderData.data.order.currency,
        name: APP_NAME,
        description: `Upgrade to ${plan.name} Plan (${isYearly ? "Yearly" : "Monthly"})`,
        order_id: orderData.data.order.id,
        handler: async function (response: any) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful!");
            router.push("/employer-dashboard");
          } catch (error) {
            console.error("Payment verification failed", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: session?.user?.name || "Employer",
          email: session?.user?.email || "",
        },
        theme: {
          color: plan.isFeatured ? "#2563eb" : "#0f172a",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to initialize payment.",
      );
    }
  };

  const isFeatured = plan.isFeatured;

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-3xl border shadow-sm transition-all duration-300",
        isFeatured
          ? "border-primary/50 bg-gradient-to-b from-[#e3ecff] to-[#e4deff] shadow-2xl lg:-translate-y-4 dark:from-blue-950 dark:to-indigo-950"
          : "border-border bg-card dark:bg-card hover:shadow-lg",
      )}
    >
      <div className="absolute inset-x-0 top-0 flex justify-center">
        {isFeatured && (
          <Badge className="rounded-t-none rounded-b-lg bg-[#2563eb] px-4 py-1.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-md hover:bg-[#2563eb]">
            Most Popular
          </Badge>
        )}
      </div>

      <CardHeader
        className={cn("px-8 pt-10 pb-6", isFeatured ? "pt-12" : "pt-10")}
      >
        <div className="space-y-2">
          <h2
            className={cn(
              "font-heading text-2xl font-bold",
              isFeatured ? "text-slate-900 dark:text-white" : "text-foreground",
            )}
          >
            {plan.name}
          </h2>
          <p
            className={cn(
              "text-sm",
              isFeatured
                ? "text-slate-700 dark:text-slate-300"
                : "text-muted-foreground",
            )}
          >
            {plan.description ||
              "Tailored hiring solutions for your business demands."}
          </p>
        </div>

        <div className="mt-6 flex flex-col pt-2">
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "font-heading text-5xl font-black",
                isFeatured
                  ? "text-slate-900 dark:text-white"
                  : "text-foreground",
              )}
            >
              {discountedPrice !== null
                ? formatCurrency(discountedPrice, plan.currency)
                : formatCurrency(currentBasePrice, plan.currency)}
            </span>
            <span
              className={cn(
                "text-sm font-semibold",
                isFeatured
                  ? "text-slate-600 dark:text-slate-400"
                  : "text-muted-foreground",
              )}
            >
              {isYearly ? "/year" : "/month"}
            </span>
          </div>
          {isYearly && currentBasePrice > 0 && (
            <span className="mt-1 text-xs font-semibold tracking-wider text-purple-700 uppercase dark:text-purple-400">
              EQUIVALENT TO{" "}
              {formatCurrency(Math.round(plan.price * 0.8), plan.currency)}
              /MONTH
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-6 px-8">
        {discountedPrice !== null && (
          <div className="-mt-2 mb-4 flex items-center gap-2">
            <span className="text-muted-foreground text-sm line-through">
              {formatCurrency(currentBasePrice, plan.currency)}
            </span>
            <Badge
              variant="outline"
              className="border-green-600 bg-green-50 text-[10px] text-green-600 uppercase dark:bg-green-950"
            >
              Save {(currentBasePrice - discountedPrice).toFixed(2)}{" "}
              {plan.currency}
            </Badge>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Coupon Code"
              className={cn(
                "border-input focus:ring-primary flex h-10 w-full rounded-lg border bg-white/50 px-3 py-1 text-sm shadow-sm backdrop-blur-sm transition-colors focus:ring-1 focus:outline-none dark:bg-black/20",
                isFeatured && "border-blue-200 dark:border-blue-800",
              )}
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
                className="h-10 rounded-lg px-4"
              >
                Apply
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeCoupon}
                className="text-destructive hover:bg-destructive/10 h-10 px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {appliedCoupon && (
            <div className="animate-in fade-in flex items-center gap-2 text-xs font-semibold text-green-600">
              <Tag className="h-3 w-3" />
              <span>Coupon "{appliedCoupon.code}" Applied</span>
            </div>
          )}
        </div>

        <ul className="space-y-4">
          {/* Static Details disguised as features */}
          <li className="flex items-start gap-3">
            <CheckCircle2
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                isFeatured ? "text-[#2563eb]" : "text-[#2563eb]",
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                isFeatured
                  ? "text-slate-800 dark:text-slate-200"
                  : "text-muted-foreground",
              )}
            >
              <strong
                className={cn(
                  isFeatured
                    ? "text-slate-900 dark:text-white"
                    : "text-foreground",
                )}
              >
                {isUnlimited ? "Unlimited" : formatJobLimit(plan.jobPostLimit)}
              </strong>{" "}
              Active Job Posts
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                isFeatured ? "text-[#2563eb]" : "text-[#2563eb]",
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                isFeatured
                  ? "text-slate-800 dark:text-slate-200"
                  : "text-muted-foreground",
              )}
            >
              Unlimited Pipeline Management
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                isFeatured ? "text-[#2563eb]" : "text-[#2563eb]",
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                isFeatured
                  ? "text-slate-800 dark:text-slate-200"
                  : "text-muted-foreground",
              )}
            >
              Posts live for{" "}
              <strong
                className={cn(
                  isFeatured
                    ? "text-slate-900 dark:text-white"
                    : "text-foreground",
                )}
              >
                {plan.postValidityDays} Days
              </strong>
            </span>
          </li>
          {plan.allowResumeDownload && (
            <li className="flex items-start gap-3">
              <CheckCircle2
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0",
                  isFeatured ? "text-[#2563eb]" : "text-[#2563eb]",
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  isFeatured
                    ? "text-slate-800 dark:text-slate-200"
                    : "text-muted-foreground",
                )}
              >
                Full Resume PDF Downloads
              </span>
            </li>
          )}

          {plan.features.length > 0 ? (
            plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    isFeatured
                      ? "text-[#2563eb]"
                      : "text-slate-400 dark:text-slate-500",
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isFeatured
                      ? "text-slate-800 dark:text-slate-200"
                      : "text-muted-foreground",
                  )}
                >
                  {feature}
                </span>
              </li>
            ))
          ) : (
            <li className="flex items-start gap-3 italic">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
              <span className="text-muted-foreground text-sm font-medium">
                Standard support included
              </span>
            </li>
          )}
        </ul>
      </CardContent>

      <CardFooter className="px-8 pb-10">
        <div className="flex w-full flex-col gap-3">
          {companyDetails?.currentPlan?._id === plan._id && hasActivePlan ? (
            <Button
              disabled
              size="lg"
              className={cn(
                "group h-12 w-full rounded-xl text-sm font-bold",
                "border-2 border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-500",
              )}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Current Plan
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePayment}
                disabled={!canPurchase}
                size="lg"
                className={cn(
                  "group h-12 w-full rounded-xl text-sm font-bold transition-all",
                  canPurchase && "cursor-pointer active:scale-95",
                  isFeatured
                    ? "bg-[#2563eb] text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700"
                    : "border-2 border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-white dark:hover:bg-slate-800",
                  !canPurchase && "opacity-60",
                )}
                variant={isFeatured ? "default" : "outline"}
              >
                {isFeatured
                  ? "Start " + plan.name + " Plan"
                  : "Get " + plan.name}
              </Button>
              {!canPurchase && (
                <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <p className="text-center text-xs font-medium">
                    Exhaust active plan to switch
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
