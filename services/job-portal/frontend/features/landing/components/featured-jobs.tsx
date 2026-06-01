"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, MapPin, Bookmark, Flame } from "lucide-react";
import { useGetJobs } from "@/features/user/hooks/use-job";

const JOBS = [
  {
    id: 1,
    company: "Linear",
    role: "Senior Product Designer",
    logo: "L",
    location: "Remote",
    type: "Full-time",
    salary: "$140k — $180k",
    tags: ["Design Systems", "Figma", "B2B SaaS"],
    category: "Design",
    hot: true,
  },
  {
    id: 2,
    company: "Vercel",
    role: "Staff Frontend Engineer",
    logo: "V",
    location: "SF / Remote",
    type: "Full-time",
    salary: "$210k — $260k",
    tags: ["React", "Next.js", "TypeScript"],
    category: "Engineering",
    hot: true,
  },
  {
    id: 3,
    company: "Stripe",
    role: "Machine Learning Engineer",
    logo: "S",
    location: "New York",
    type: "Full-time",
    salary: "$185k — $240k",
    tags: ["PyTorch", "Fraud ML", "Python"],
    category: "Data & AI",
  },
  {
    id: 4,
    company: "Figma",
    role: "Growth Marketing Lead",
    logo: "F",
    location: "Remote — EU",
    type: "Full-time",
    salary: "€95k — €125k",
    tags: ["Lifecycle", "SEO", "Analytics"],
    category: "Marketing",
  },
  {
    id: 5,
    company: "Ramp",
    role: "Senior DevOps Engineer",
    logo: "R",
    location: "Remote",
    type: "Full-time",
    salary: "$170k — $220k",
    tags: ["AWS", "Terraform", "K8s"],
    category: "Engineering",
  },
  {
    id: 6,
    company: "Notion",
    role: "Product Manager, AI",
    logo: "N",
    location: "SF",
    type: "Full-time",
    salary: "$200k — $250k",
    tags: ["LLM", "0-1", "Research"],
    category: "Data & AI",
    hot: true,
  },
];

const FILTERS = ["All", "Engineering", "Design", "Data & AI", "Marketing"];
const EASE = [0.22, 1, 0.36, 1];

export const FeaturedJobs = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [savedJobs, setSavedJobs] = useState<Set<any>>(new Set());

  // Dynamic Query from Database
  const { data: responseData, isLoading } = useGetJobs({
    limit: 6,
    search: activeTab === "All" ? undefined : activeTab,
  });

  const toggleSave = (e: any, id: string | number) => {
    e.preventDefault(); // Stop navigation
    e.stopPropagation();
    const newSaved = new Set(savedJobs);
    if (newSaved.has(id)) newSaved.delete(id);
    else newSaved.add(id);
    setSavedJobs(newSaved);
  };

  const dbJobs = responseData?.data?.jobs || [];
  const filteredMockJobs = JOBS.filter(
    (job) => activeTab === "All" || job.category === activeTab
  );

  const displayJobs = dbJobs.length > 0 ? dbJobs.slice(0, 6) : filteredMockJobs;

  return (
    <section
      id="jobs"
      className="py-24 md:py-32 bg-slate-50 border-y border-slate-200"
      data-testid="featured-jobs-section"
    >
      <div className="max-w-[88rem] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div>
            <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-black text-indigo-600">
              Handpicked
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl mt-3 text-slate-900 font-bold leading-tight tracking-tight max-w-3xl">
              Featured roles, updated <br className="hidden md:block" />
              <span className="text-indigo-600">every hour.</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 p-1 bg-white border border-slate-200 rounded-2xl w-fit">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveTab(f)}
                className={`px-5 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === f
                  ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                  : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Job List Container */}
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
          <motion.div layout className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                  <p className="font-bold text-sm tracking-wide">Loading featured roles...</p>
                </div>
              ) : displayJobs.length === 0 ? (
                <div className="p-16 text-center text-slate-400">
                  <p className="font-bold text-lg">No active jobs found</p>
                  <p className="text-sm mt-1">Check back later or post your first job vacancy!</p>
                </div>
              ) : (
                displayJobs.map((job: any) => {
                  const jobId = job._id || job.id;
                  const companyName = typeof job.company === 'object' ? job.company?.name : job.company;
                  const roleName = job.role || job.title;
                  const isHot = job.hot || job.isFeatured;
                  const jobTags = job.tags || job.skills || [];

                  // Location formatting
                  let locStr = "Remote";
                  if (typeof job.location === 'object' && job.location !== null) {
                    const cityStr = job.location.city || "";
                    const isRemote = job.location.remote === true;
                    if (cityStr && isRemote) locStr = `${cityStr} / Remote`;
                    else if (isRemote) locStr = "Remote";
                    else if (cityStr) locStr = cityStr;
                  } else if (job.location) {
                    locStr = job.location;
                  }

                  const employementTypeStr = job.type || (job.employmentType ? job.employmentType.replace("_", " ") : "Full-time");

                  // Salary formatting
                  let salaryStr = typeof job.salary === 'object' && job.salary !== null
                    ? `₹${job.salary.min ? job.salary.min.toLocaleString() : "0"} - ₹${job.salary.max ? job.salary.max.toLocaleString() : "0"}`
                    : (job.salary || "N/A");

                  // Logo logic
                  let logoEl = <span className="font-bold text-2xl text-indigo-600">{companyName?.charAt(0) || "J"}</span>;
                  if (job.logo) {
                    logoEl = <span className="font-bold text-2xl text-indigo-600">{job.logo}</span>;
                  } else if (typeof job.company === 'object' && job.company?.logo) {
                    logoEl = <img src={job.company.logo.url} alt={companyName} className="w-full h-full object-cover rounded-2xl" />;
                  }

                  return (
                    <motion.a
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: "easeIn" }}
                      href={`/jobs/${jobId}`}
                      key={String(jobId)}
                      className="group relative flex flex-col md:flex-row md:items-center gap-6 px-6 md:px-10 py-8 hover:bg-indigo-50/30 transition-colors cursor-pointer"
                    >
                      {/* Left: Brand */}
                      <div className="flex items-center gap-5 flex-1">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-2xl text-indigo-600 group-hover:scale-110 group-hover:bg-white transition-all duration-300 overflow-hidden">
                          {logoEl}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">
                              {companyName}
                            </span>
                            {isHot && (
                              <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 tracking-wider uppercase">
                                <Flame size={10} fill="currentColor" /> Hot
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {roleName}
                          </h3>
                        </div>
                      </div>

                      {/* Middle: Tags (Visible on Tablet/Desktop) */}
                      <div className="hidden lg:flex flex-wrap gap-2 flex-1">
                        {jobTags.slice(0, 3).map((t: string) => (
                          <span
                            key={t}
                            className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-semibold rounded-lg border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-colors"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Right: Meta & Actions */}
                      <div className="flex items-center justify-between md:justify-end gap-8">
                        <div className="text-left md:text-right">
                          <div className="flex items-center md:justify-end gap-1.5 text-sm font-medium text-slate-500 mb-1">
                            <MapPin size={14} /> {locStr} · {employementTypeStr}
                          </div>
                          <div className="text-sm font-black text-slate-900 tracking-tight">
                            {salaryStr}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => toggleSave(e, jobId)}
                            className={`p-2.5 rounded-full border transition-all duration-300 ${savedJobs.has(jobId)
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200"
                              }`}
                            aria-label="Save job"
                          >
                            <Bookmark size={18} fill={savedJobs.has(jobId) ? "currentColor" : "none"} />
                          </button>
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-indigo-600 transition-colors group-hover:translate-x-1 duration-300">
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

        {/* Footer CTA */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => router.push("/find-jobs")}
            className="group px-8 py-4 bg-white border-2 border-slate-200 hover:border-indigo-600 text-slate-900 hover:text-indigo-600 rounded-2xl font-bold transition-all duration-300 flex items-center gap-3 shadow-sm hover:shadow-xl hover:shadow-indigo-100"
          >
            Browse all 12,804 jobs
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};