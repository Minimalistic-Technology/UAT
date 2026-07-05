import { TopCoupon } from "../../services/analytics.service";

export function AdminTopCoupons({ coupons }: { coupons: TopCoupon[] }) {
  return (
    <div className="flex max-h-[400px] min-h-fit flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_2px_15px_rgba(0,0,0,0.04)] sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 shrink-0 text-[17px] leading-tight font-bold text-slate-900 sm:mb-6 dark:text-white">
        Top Performing Coupons
      </h3>

      <div className="-mr-2 flex-1 space-y-3 overflow-y-auto pr-2 sm:space-y-4">
        {coupons && coupons.length > 0 ? (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-colors hover:border-[#2563eb]/50 sm:p-4 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-lg bg-[#8b5cf6]/10 px-2.5 py-1.5 text-xs font-bold text-[#8b5cf6] sm:px-3 sm:py-2 sm:text-sm">
                  {coupon.type === "PERCENTAGE"
                    ? `${coupon.value}%`
                    : `₹${coupon.value}`}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                    {coupon.code}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 sm:text-[11px]">
                    {coupon.isActive ? "Active" : "Expired"} ·{" "}
                    {coupon.usageCount} uses
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-[#2563eb] sm:text-sm">
                  {coupon.maxUses === -1
                    ? "Unlimited"
                    : `${coupon.maxUses} Limit`}
                </span>
                <span className="mt-0.5 text-[8px] font-bold tracking-wider text-emerald-500 uppercase sm:text-[9px]">
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
