"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Search, MapPin, ArrowRight, Sparkles } from "lucide-react";

const HERO_IMG =
  "https://static.prod-images.emergentagent.com/jobs/87777c5c-7e2c-4061-8282-ba379018b5d9/images/4875748569644802a5299bebc70d6cc03edfbe99e13775be46ebaa3d46968232.png";

const CHIPS = [
  "Product Designer",
  "React Engineer",
  "Data Scientist",
  "DevOps",
  "Marketing Lead",
];

export const Hero = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !location.trim()) {
      router.push("/find-jobs");
      return;
    }
    const params = new URLSearchParams();
    if (title.trim()) params.set("search", title.trim());
    if (location.trim()) {
      if (location.trim().toLowerCase() === "remote") {
        params.set("remote", "true");
      } else {
        params.set("city", location.trim());
      }
    }
    router.push(`/find-jobs?${params.toString()}`);
  };

  const handleChipClick = (chip: string) => {
    router.push(`/find-jobs?search=${encodeURIComponent(chip)}`);
  };

  return (
    <section
      id="top"
      className="relative pt-10 pb-8 md:pb-8 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300"
      data-testid="hero-section"
    >
      {/* Decorative Orbs */}
      <div
        className="absolute rounded-full blur-[120px] opacity-50 bg-[#EEF2FF] w-[520px] h-[520px] -top-40 -left-32 -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute rounded-full blur-[100px] opacity-50 bg-[#DBEAFE] w-[460px] h-[460px] top-40 right-[-100px] -z-10"
        aria-hidden="true"
      />

      {/* Grid Overlay - Assuming a simple CSS pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative max-w-[88rem] mx-auto px-6 md:px-12">
        <div className="flex flex-col items-center text-center w-full max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeIn" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold tracking-wider uppercase mb-8"
            data-testid="hero-eyebrow"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            12,804 jobs posted this week
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeIn", delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold leading-tight lg:leading-[1.1] text-slate-900 dark:text-white tracking-tight"
            data-testid="hero-headline"
          >
            The career platform that{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-indigo-600">actually</span>
              <svg
                viewBox="0 0 300 14"
                className="absolute left-0 right-0 -bottom-1 lg:-bottom-2 w-full"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <motion.path
                  d="M2 8 Q 60 2, 150 7 T 298 6"
                  stroke="#4F46E5"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1, delay: 0.8, ease: "easeIn" }}
                />
              </svg>
            </span>
            {" "}hires.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeIn", delay: 0.2 }}
            className="mt-8 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed mx-auto"
            data-testid="hero-subheadline"
          >
            Search 12k+ vetted roles from companies that care about craft.
            No recruiter noise. No ghosting. Just the next step in your
            career — matched to you.
          </motion.p>

          {/* Search Bar Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeIn", delay: 0.3 }}
            className="mt-12 w-full max-w-4xl mx-auto"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col md:flex-row items-stretch bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 dark:focus-within:ring-indigo-900/50 rounded-[1.25rem] overflow-hidden transition-all duration-300 shadow-2xl shadow-indigo-100/50 dark:shadow-none"
              data-testid="hero-search"
            >
              <div className="flex items-center gap-3 flex-1 px-5 py-5 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                <Search size={22} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, skill, or company"
                  className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-lg"
                  data-testid="search-title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 flex-1 px-5 py-5 border-b md:border-b-0 border-slate-100 dark:border-slate-800">
                <MapPin size={22} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Remote, or city"
                  className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-lg"
                  data-testid="search-location-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="m-2 md:ml-0 md:my-2 md:mr-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 group"
                data-testid="search-submit-btn"
              >
                Search
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-black tracking-widest uppercase text-slate-400 mr-2">
                Trending
              </span>
              {CHIPS.map((chip, i) => (
                <motion.button
                  key={chip}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.06, ease: "easeIn" }}
                  onClick={() => handleChipClick(chip)}
                  className="px-4 py-2 text-sm font-medium rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-600 hover:text-indigo-600 transition-all duration-200 shadow-sm"
                >
                  {chip}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};