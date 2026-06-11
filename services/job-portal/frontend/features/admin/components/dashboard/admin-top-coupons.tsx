import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminTopCoupons({ coupons }: { coupons: any[] }) {
    return (
        <div className="rounded-[20px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[17px] font-bold text-slate-900 dark:text-white leading-tight">
                    Top Performing<br />Coupons
                </h3>
                <Button
                    variant="secondary"
                    asChild
                    className="bg-[#2563eb]/10 hover:bg-[#2563eb]/20 text-[#2563eb] font-semibold hidden sm:flex rounded-xl"
                >
                    <Link href="/admin-dashboard/coupons/create">+ New Coupon</Link>
                </Button>
            </div>

            <div className="space-y-4">
                {coupons && coupons.length > 0 ? (
                    coupons.map((coupon) => (
                        <div
                            key={coupon._id}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-[#2563eb]/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-2 rounded-lg font-bold text-sm bg-[#8b5cf6]/10 text-[#8b5cf6]">
                                    {coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 dark:text-white">{coupon.code}</span>
                                    <span className="text-[11px] text-slate-500 font-medium">
                                        {coupon.isActive ? "Active" : "Expired"} · {coupon.usageCount} uses
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-[#2563eb] text-sm">
                                    {coupon.maxUses === -1 ? "Unlimited" : `${coupon.maxUses} Limit`}
                                </span>
                                <span className="text-[9px] font-bold tracking-wider uppercase text-emerald-500 mt-0.5">
                                    Top Used
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-8 text-center text-slate-500 text-sm">No active coupons found.</div>
                )}
            </div>
        </div>
    );
}
