import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminTopCoupons({ coupons }: { coupons: any[] }) {
  return (
    <div className="flex max-h-[400px] min-h-fit flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-6 shrink-0 text-[17px] leading-tight font-bold text-slate-900 dark:text-white">
        Top Performing Coupons
      </h3>

      <div className="-mr-2 flex-1 space-y-4 overflow-y-auto pr-2">
        {coupons && coupons.length > 0 ? (
          coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:border-[#2563eb]/50 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-[#8b5cf6]/10 px-3 py-2 text-sm font-bold text-[#8b5cf6]">
                  {coupon.type === "percentage"
                    ? `${coupon.value}%`
                    : `₹${coupon.value}`}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {coupon.code}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {coupon.isActive ? "Active" : "Expired"} ·{" "}
                    {coupon.usageCount} uses
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-[#2563eb]">
                  {coupon.maxUses === -1
                    ? "Unlimited"
                    : `${coupon.maxUses} Limit`}
                </span>
                <span className="mt-0.5 text-[9px] font-bold tracking-wider text-emerald-500 uppercase">
                  Top Used
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-slate-500">
            No active coupons found.
          </div>
        )}
      </div>
    </div>
  );
}
