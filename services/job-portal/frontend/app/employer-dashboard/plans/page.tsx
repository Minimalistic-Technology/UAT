"use client";
import { useState } from "react";

import { Briefcase, AlertCircle, Check, Minus, ArrowRight, PhoneCall } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plan } from "@/features/employer/types";
import { cn } from "@/lib/utils";
import { useGetPlans } from "@/features/employer/hooks/use-plans";
import { PlanCard } from "@/features/employer/components/plan-card";
import { useGetMyCompanyDetails } from "@/features/employer/hooks/use-company";
import { Button } from "@/components/ui/button";
import { formatJobLimit, formatDuration } from "@/features/employer/helper/plan.helper";

export default function PlansPage() {
  const { data: plansResponse, isLoading, isError } = useGetPlans();
  const {
    data: companyResponse,
    isLoading: companyIsLoading,
    isError: companyIsError
  } = useGetMyCompanyDetails();

  const companyDetails = companyResponse?.data;
  const isUnverified = companyDetails?.isVerified === false;

  const plans: Plan[] = plansResponse?.data.plans ?? [];

  const sortedPlans = [...plans].sort((a, b) => {
    // Force a specific order so Featured is usually in the middle visually
    // However, if we just use DisplayOrder, keep it.
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });

  // Re-adjust array visually for 3 columns: let featured be in middle if exactly 3 plans
  // If array has 3 items and index 0 is featured, swap 0 and 1.
  const visualPlans = [...sortedPlans];
  if (visualPlans.length === 3 && visualPlans[0].isFeatured) {
    const temp = visualPlans[1];
    visualPlans[1] = visualPlans[0];
    visualPlans[0] = temp;
  }

  // Ensure unique mapped features for Compare Table
  const allFeaturesRows = Array.from(new Set(plans.flatMap(p => p.features)));

  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="flex flex-col w-full">
      {/* Header Section */}
      <div className="pt-4 pb-8 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
          Pricing Built for Growth
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Empower your recruitment team with intelligent hiring. Choose the plan that fits your current needs and scale as you grow.
        </p>

        {/* Toggle Switch */}
        {/* <div className="mt-10 flex items-center justify-center gap-3">
          <span className={cn("text-sm font-semibold cursor-pointer transition-colors", !isYearly ? "text-slate-900 dark:text-white" : "text-slate-500")} onClick={() => setIsYearly(false)}>Monthly</span>
          <div
            className={cn("w-12 h-6 rounded-full p-1 relative cursor-pointer outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500", isYearly ? "bg-purple-600" : "bg-[#2563eb]")}
            onClick={() => setIsYearly(!isYearly)}
            role="switch"
            aria-checked={isYearly}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsYearly(!isYearly); } }}
          >
            <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300", isYearly ? "translate-x-6" : "translate-x-0")}></div>
          </div>
          <span className={cn("text-sm font-semibold cursor-pointer transition-colors", isYearly ? "text-slate-900 dark:text-white" : "text-slate-500")} onClick={() => setIsYearly(true)}>Yearly</span>
          <span className="ml-1 bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">Save 20%</span>
        </div> */}
      </div>

      <div className="px-6 lg:px-10">
        {/* Error State */}
        {(isError || companyIsError) && (
          <Alert variant="destructive" className="mx-auto max-w-2xl py-2 mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              We couldn't load the subscription plans. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Plans Grid */}
        <div
          className={cn(
            "grid justify-center gap-6 w-full mx-auto mt-4",
            visualPlans.length === 1
              ? "grid-cols-1 max-w-md"
              : visualPlans.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-4xl"
                : visualPlans.length === 3
                  ? "grid-cols-1 md:grid-cols-3 max-w-6xl"
                  : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
          )}
        >
          {isLoading || companyIsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <PlanSkeleton key={i} />)
          ) : visualPlans.length === 0 && !isError ? (
            <EmptyState />
          ) : (
            visualPlans.map((plan) => (
              <div key={plan._id} className="h-full z-10 w-full relative">
                <PlanCard plan={plan} isYearly={isYearly} />
              </div>
            ))
          )}
        </div>

        {/* Compare Features Section */}
        {visualPlans.length > 0 && (
          <div className="mt-20 w-full mb-10">
            <h2 className="text-3xl font-bold text-center mb-10 text-slate-900 dark:text-white font-heading">Compare All Features</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-5 px-4 text-xs font-bold uppercase tracking-widest text-slate-500 w-1/3">Features</th>
                    {visualPlans.map(plan => (
                      <th key={`head-${plan._id}`} className="py-5 px-4 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white text-center">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-5 px-4 font-semibold text-slate-700 dark:text-slate-300">Job Postings</td>
                    {visualPlans.map(plan => (
                      <td key={`job-${plan._id}`} className="py-5 px-4 text-center text-slate-600 dark:text-slate-400 font-medium">
                        {plan.jobPostLimit === -1 ? 'Unlimited' : `${plan.jobPostLimit} Active`}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-5 px-4 font-semibold text-slate-700 dark:text-slate-300">Listing Duration</td>
                    {visualPlans.map(plan => (
                      <td key={`dur-${plan._id}`} className="py-5 px-4 text-center text-slate-600 dark:text-slate-400 font-medium">
                        {plan.postValidityDays} Days
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-5 px-4 font-semibold text-slate-700 dark:text-slate-300">Resume PDF Downloads</td>
                    {visualPlans.map(plan => (
                      <td key={`res-${plan._id}`} className="py-5 px-4 text-center flex justify-center">
                        {plan.allowResumeDownload ? <Check className="text-blue-600 size-5" /> : <Minus className="text-slate-300 size-5" />}
                      </td>
                    ))}
                  </tr>
                  {allFeaturesRows.slice(0, 5).map((featureText, idx) => (
                    <tr key={`featrow-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-5 px-4 font-semibold text-slate-700 dark:text-slate-300">{featureText}</td>
                      {visualPlans.map(plan => {
                        const hasFeat = plan.features.includes(featureText);
                        return (
                          <td key={`featcol-${plan._id}-${idx}`} className="py-5 px-4 text-center flex justify-center">
                            {hasFeat ? <Check className="text-blue-600 size-5" /> : <Minus className="text-slate-300 size-5" />}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-32 max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-slate-900 dark:text-white font-heading">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
              <h4 className="font-bold text-[#2563eb] mb-2">Can I change plans at any time?</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Yes, you can upgrade or downgrade your plan at any time from your dashboard settings. If you upgrade, the change is immediate.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
              <h4 className="font-bold text-[#2563eb] mb-2">How does the Resume Ranking work?</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Our AI analyzes candidate resumes against your job description requirements, scoring them on skills to surface top talent faster.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
              <h4 className="font-bold text-[#2563eb] mb-2">Do you offer a free trial?</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Absolutely. Select plans come with a 14-day free trial. No credit card is required to start exploring the premium recruitment features.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
              <h4 className="font-bold text-[#2563eb] mb-2">What kind of support do you provide?</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Starter users get email support. Professional users receive 24/7 priority chat support. Enterprise clients have a dedicated success manager.</p>
            </div>
          </div>
        </div>

        {/* Footer CTA Section */}
        <div className="mt-32 max-w-5xl mx-auto px-4 mb-10">
          <div className="bg-[#0b51da] rounded-[2rem] p-10 md:p-14 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-3xl md:text-5xl font-black text-white font-heading tracking-tight mb-4 text-center">Ready to hire better?</h2>
              <p className="text-blue-100 mb-10 max-w-xl text-center text-sm md:text-base font-medium">
                Join top companies using our Job Portal to build world-class teams without the manual overhead.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button className="bg-white text-[#2563eb] hover:bg-slate-50 font-bold h-12 px-8 rounded-xl shadow-lg border-none" size="lg">
                  Get Started for Free
                </Button>
                <Button variant="outline" className="bg-[#1e40af] border-none hover:bg-[#1e3a8a] text-white hover:text-white font-bold h-12 px-8 rounded-xl" size="lg">
                  Schedule a Demo
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="col-span-full border-dashed bg-slate-50/50 dark:bg-slate-900/50 py-20 rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
      <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-white dark:bg-slate-800 p-4 shadow-sm">
          <Briefcase className="h-10 w-10 text-slate-400" />
        </div>
        <div className="space-y-2">
          <CardTitle>No plans available</CardTitle>
          <CardDescription>
            There are currently no active subscription plans. Check back later.
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
}

function PlanSkeleton() {
  return (
    <Card className="flex h-[36rem] flex-col rounded-[20px] border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)] bg-white dark:bg-slate-900">
      <CardHeader className="space-y-4 pt-10 px-8">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-1/2" />
      </CardHeader>
      <CardContent className="flex-1 space-y-6 px-8">
        <div className="space-y-4 mt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
      <div className="p-8 pt-0">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </Card>
  );
}
