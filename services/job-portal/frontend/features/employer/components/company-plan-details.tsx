import { Calendar, CreditCard } from "lucide-react";

interface CompanyPlanDetailsProps {
  company: any;
}

export const CompanyPlanDetails = ({ company }: CompanyPlanDetailsProps) => {
  return (
    <div className="h-full space-y-6 rounded-[20px] border-0 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:bg-slate-900">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <CreditCard className="h-5 w-5" />
        Plan Details
      </h3>

      {company.subscription ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Current Plan
            </span>
            <span className="rounded-md bg-indigo-50 px-2 py-1 text-sm font-bold text-indigo-600">
              {company.currentPlan?.name || "Active Plan"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-sm font-medium text-slate-500">
              <Calendar className="h-4 w-4" />
              Expiry Date
            </span>
            <span className="text-sm font-medium text-slate-900">
              {company.subscription.expiryDate
                ? new Date(company.subscription.expiryDate).toLocaleDateString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )
                : "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Remaining Posts
            </span>
            <span className="text-sm font-medium text-slate-900">
              {company.remainingJobPosts ?? "N/A"}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-500">
          No active subscription plan.
        </div>
      )}
    </div>
  );
};
