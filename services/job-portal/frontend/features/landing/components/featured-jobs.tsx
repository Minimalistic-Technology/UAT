"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Flame } from "lucide-react";
import { useGetJobs } from "@/features/user/hooks/use-job";

const FILTERS = ["All", "Engineering", "Design", "Data & AI", "Marketing"];
const EASE = [0.22, 1, 0.36, 1];

export const FeaturedJobs = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");

  // Dynamic Query from Database
  const { data: responseData, isLoading } = useGetJobs({
    limit: 6,
    search: activeTab === "All" ? undefined : activeTab,
  });

  const dbJobs = responseData?.data?.jobs || [];
  const displayJobs = dbJobs.slice(0, 6);

  return (
    <section
      id="jobs"
      className="border-y border-slate-200 bg-slate-50 py-24 md:py-32"
      data-testid="featured-jobs-section"
    >
      <div className="mx-auto max-w-[88rem] px-6 md:px-12">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-primary text-[10px] font-black tracking-[0.2em] uppercase md:text-xs">
              Handpicked
            </span>
            <h2 className="mt-3 max-w-3xl text-4xl leading-tight font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Featured roles, updated <br className="hidden md:block" />
              <span className="text-primary">every hour.</span>
            </h2>
          </div>

          <div className="flex w-fit flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1">
            {FILTERS.map((f) => (
              <Button
                key={f}
                variant="ghost"
                onClick={() => setActiveTab(f)}
                className={`h-10 rounded-xl px-5 py-2 text-sm font-bold transition-all duration-300 ${
                  activeTab === f
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200 hover:bg-slate-800 hover:text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Job List Container */}
        <div className="scrollbar-hide max-h-[600px] overflow-y-scroll rounded-4xl border border-slate-200 bg-white shadow-sm">
          <motion.div layout className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="p-16 text-center text-slate-400">
                  <p className="text-lg font-bold">Loading jobs...</p>
                </div>
              ) : displayJobs.length === 0 ? (
                <div className="p-16 text-center text-slate-400">
                  <p className="text-lg font-bold">No active jobs found</p>
                  <p className="mt-1 text-sm">
                    Check back later or post your first job vacancy!
                  </p>
                </div>
              ) : (
                displayJobs.map((job: any) => {
                  const jobId = job._id || job.id;
                  const companyName =
                    typeof job.company === "object"
                      ? job.company?.name
                      : job.company;
                  const roleName = job.role || job.title;
                  const isHot = job.hot || job.isFeatured;
                  const jobTags = job.tags || job.skills || [];

                  // Location formatting
                  let locStr = "Remote";
                  if (
                    typeof job.location === "object" &&
                    job.location !== null
                  ) {
                    const cityStr = job.location.city || "";
                    const isRemote = job.location.remote === true;
                    if (cityStr && isRemote) locStr = `${cityStr} / Remote`;
                    else if (isRemote) locStr = "Remote";
                    else if (cityStr) locStr = cityStr;
                  } else if (job.location) {
                    locStr = job.location;
                  }

                  const employementTypeStr =
                    job.type ||
                    (job.employmentType
                      ? job.employmentType.replace("_", " ")
                      : "Full-time");

                  // Salary/Stipend formatting
                  let salaryStr = "Salary not disclosed";
                  if (job.listingType === "internship") {
                    if (job.stipend?.type === "unpaid") {
                      salaryStr = "Unpaid";
                    } else if (job.stipend?.amount) {
                      salaryStr = `₹${job.stipend.amount.toLocaleString()} / ${job.stipend.period}`;
                    } else if (job.stipend?.type) {
                      salaryStr = `${job.stipend.type} Stipend`;
                    }
                  } else {
                    if (typeof job.salary === "object" && job.salary !== null) {
                      if (job.salary.min && job.salary.max) {
                        salaryStr = `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}`;
                      } else if (job.salary.min) {
                        salaryStr = `From ₹${job.salary.min.toLocaleString()}`;
                      } else if (job.salary.max) {
                        salaryStr = `Up to ₹${job.salary.max.toLocaleString()}`;
                      }
                    } else if (typeof job.salary === "string" && job.salary) {
                      salaryStr = job.salary;
                    }
                  }

                  // Logo logic
                  let logoEl = (
                    <span className="text-primary text-2xl font-bold">
                      {companyName?.charAt(0) || "J"}
                    </span>
                  );
                  if (job.logo) {
                    logoEl = (
                      <span className="text-primary text-2xl font-bold">
                        {job.logo}
                      </span>
                    );
                  } else if (
                    typeof job.company === "object" &&
                    job.company?.logo
                  ) {
                    logoEl = (
                      <img
                        src={job.company.logo.url}
                        alt={companyName}
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    );
                  }

                  return (
                    <motion.a
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: "easeIn" }}
                      href={job.listingType === "job" ? `/job/${jobId}` : `/internship/${jobId}`}
                      key={String(jobId)}
                      className="group hover:bg-primary/5 relative flex cursor-pointer flex-col gap-6 px-6 py-8 transition-colors md:flex-row md:items-center md:px-10"
                    >
                      {/* Left: Brand — fixed width 40% */}
                      <div className="flex min-w-0 items-center gap-5 md:w-[40%]">
                        <div className="text-primary flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 text-2xl font-bold transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
                          {logoEl}
                        </div>
                        <div className="min-w-0">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="truncate text-sm font-bold tracking-tight text-slate-400 uppercase">
                              {companyName}
                            </span>
                          </div>
                          <h3 className="group-hover:text-primary line-clamp-2 text-xl font-bold text-slate-900 transition-colors">
                            {roleName}
                          </h3>
                        </div>
                      </div>

                      {/* Middle: Tags — fixed width 30%, always aligned */}
                      <div className="hidden flex-col justify-center gap-2 md:w-[30%] lg:flex">
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          Required Skills
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {jobTags.slice(0, 3).map((t: string) => (
                            <span
                              key={t}
                              className="group-hover:border-primary/20 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500 transition-colors group-hover:bg-white"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Meta & Actions — fixed width 30% */}
                      <div className="flex shrink-0 items-center justify-between gap-6 md:w-[30%] md:justify-end">
                        <div className="text-left md:text-right">
                          <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-500 md:justify-end">
                            <MapPin size={14} /> {locStr} · {employementTypeStr}
                          </div>
                          <div className="text-sm font-black tracking-tight text-slate-900">
                            {salaryStr}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="group-hover:bg-primary flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition-colors duration-300 group-hover:translate-x-1">
                            <ArrowRight size={18} />
                          </div>
                        </div>
                      </div>
                    </motion.a>
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/find-jobs")}
            className="group hover:border-primary hover:text-primary hover:shadow-primary/20 flex h-14 items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-8 font-bold text-slate-900 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-xl"
          >
            Browse all jobs
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Button>
        </div>
      </div>
    </section>
  );
};
