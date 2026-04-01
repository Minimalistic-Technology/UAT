"use client";

import { formatCurrency, formatJobLimit, formatDuration } from "../helpers/employer.helper";
import { Briefcase, Check, Clock, Infinity, Star, Zap } from "lucide-react";
import type { Plan } from "../types";
import { loadRazorpayScript } from "@/lib/razorpay-script";
import { createOrder } from "../services";
import { useSession } from "next-auth/react";

const PLAN_ACCENTS = [
  {
    border: "border-blue-200",
    badge: "bg-blue-50 text-blue-700",
    check: "text-blue-500",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    highlight: "bg-blue-50",
    tag: "bg-blue-100 text-blue-800",
  },
  {
    border: "border-violet-200",
    badge: "bg-violet-50 text-violet-700",
    check: "text-violet-500",
    button: "bg-violet-600 hover:bg-violet-700 text-white",
    highlight: "bg-violet-50",
    tag: "bg-violet-100 text-violet-800",
  },
  {
    border: "border-emerald-200",
    badge: "bg-emerald-50 text-emerald-700",
    check: "text-emerald-500",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white",
    highlight: "bg-emerald-50",
    tag: "bg-emerald-100 text-emerald-800",
  },
  {
    border: "border-orange-200",
    badge: "bg-orange-50 text-orange-700",
    check: "text-orange-500",
    button: "bg-orange-600 hover:bg-orange-700 text-white",
    highlight: "bg-orange-50",
    tag: "bg-orange-100 text-orange-800",
  },
];

interface PlanCardProps {
  plan: Plan;
  index: number;
}

export function PlanCard({ plan, index }: PlanCardProps) {
  const accent = PLAN_ACCENTS[index % PLAN_ACCENTS.length];
  const isUnlimited = plan.jobPostLimit === -1;

  const { data: session, status } = useSession();
  const userId = session?.user.id;

  const handlePayment = async () => {
    const isLoaded = await loadRazorpayScript();

    if (!isLoaded) {
      alert("Razorpay SDK failed to load. Please check your connection.");
      return;
    }

    try {
      const payload = {
        amount: Number(plan.price) * 100,
        planId: plan._id,
        userId: userId!,
        internalOrderId: `ORD_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };
      console.log(payload)

      const orderData = await createOrder(payload);
      console.log("orderData", orderData);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HireHub",
        description: `Upgrade to ${plan.name}`,
        order_id: orderData.id, // This is the rpOrder.id from backend
        handler: function (response: any) {
          // This runs on successful payment
          console.log("Payment Successful", response);
          window.location.href = `/employer/dashboard?payment=success&orderId=${orderData.id}`;
        },
        prefill: {
          name: "Employer Name",
          email: "employer@example.com",
        },
        theme: {
          color: plan.isFeatured ? "#7c3aed" : "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <div
      className={`relative flex flex-col h-full rounded-2xl border-2 ${
        plan.isFeatured
          ? "border-violet-400 shadow-xl shadow-violet-100 scale-[1.02]"
          : accent.border + " shadow-sm hover:shadow-md"
      } bg-white transition-all duration-200 overflow-hidden`}
    >
      {/* Featured ribbon */}
      {plan.isFeatured && (
        <div className="absolute top-0 right-0 bg-violet-600 text-white text-xs font-semibold px-4 py-1 rounded-bl-xl flex items-center gap-1 z-10">
          <Star className="h-3 w-3 fill-white" />
          Most Popular
        </div>
      )}

      {plan.isDefault && (
        <div className="absolute top-0 left-0 bg-gray-700 text-white text-xs font-semibold px-4 py-1 rounded-br-xl z-10">
          Default
        </div>
      )}

      {/* Header */}
      <div className={`px-7 pt-10 pb-5 ${plan.isFeatured ? "bg-violet-50" : accent.highlight}`}>
        <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
        {plan.description && (
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {plan.description}
          </p>
        )}

        <div className="mt-5 flex items-end gap-1">
          <div className="flex flex-col">
            <span className="text-4xl font-extrabold text-gray-900 leading-none">
              {formatCurrency(plan.price, plan.currency)}
            </span>
          </div>
          <span className="text-sm text-gray-500 mb-1">
            / {formatDuration(plan.durationDays)}
          </span>
        </div>

        {/* Quick stats */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${accent.tag}`}>
            <Briefcase className="h-3.5 w-3.5" />
            {formatJobLimit(plan.jobPostLimit)}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${accent.tag}`}>
            {isUnlimited ? <Infinity className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
            {formatDuration(plan.durationDays)} validity
          </span>
        </div>
      </div>

      {/* Features List */}
      <div className="flex-1 px-7 py-6">
        <ul className="space-y-3">
          {plan.features.length > 0 ? (
            plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className={`h-4 w-4 mt-0.5 shrink-0 ${accent.check}`} />
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-400 italic">Standard platform features included.</li>
          )}
        </ul>
      </div>

      {/* Action Button */}
      <div className="px-7 pb-7">
        <button
          onClick={handlePayment}
          className={`w-full cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-150 active:scale-95 ${
            plan.isFeatured
              ? "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200"
              : accent.button
          }`}
        >
          <Zap className="h-4 w-4 fill-current" />
          Get {plan.name}
        </button>
      </div>
    </div>
  );
}