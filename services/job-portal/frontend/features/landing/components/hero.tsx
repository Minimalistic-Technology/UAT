"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-slate-100 bg-white pt-8 pb-16 transition-colors duration-300 md:pt-12 md:pb-24 dark:border-slate-800/50 dark:bg-[#0A0F1C]"
      data-testid="hero-section"
    >
      {/* Decorative Premium Glows */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 -z-10 h-[600px] w-[600px] rounded-full bg-[#2563eb] opacity-[0.15] blur-[140px] dark:opacity-20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-40 right-[-100px] -z-10 h-[500px] w-[500px] rounded-full bg-[#00c8ff] opacity-[0.1] blur-[120px] dark:opacity-[0.15]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[88rem] flex-1 flex-col items-center px-6 md:px-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          {/* Top Pill / Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/80 px-4 py-1.5 text-[11px] font-bold tracking-widest text-[#2563eb] uppercase shadow-sm backdrop-blur-md dark:border-blue-800/30 dark:bg-blue-900/10 dark:text-[#60a5fa]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2563eb] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2563eb]"></span>
            </span>
            {/* <span className="mt-px">Over 10,000 top companies hiring</span> */}
            <span className="mt-px">Find your next career opportunity</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="text-4xl leading-[1.1] font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-[5.5rem] dark:text-white"
          >
            Find work that{" "}
            <span className="relative inline-block bg-gradient-to-r from-[#2563eb] to-[#00d4ff] bg-clip-text text-transparent">
              actually
              <svg
                viewBox="0 0 300 14"
                className="absolute right-0 -bottom-1 left-0 w-full lg:-bottom-2"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M2 8 Q 60 2, 150 7 T 298 6"
                  stroke="#2563eb"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1, delay: 0.6, ease: "easeOut" }}
                />
              </svg>
            </span>{" "}
            moves you.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed font-medium text-slate-600 md:text-xl dark:text-slate-400"
          >
            Search through various vetted opportunities from top startups and
            Fortune 500s. No recruiter spam. No ghosting. Just exact matches.
          </motion.p>

          {/* Glass Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="group relative mx-auto mt-14 w-full max-w-4xl"
          >
            <div className="absolute -inset-0.5 rounded-[1.25rem] bg-gradient-to-r from-[#2563eb] to-[#00d4ff] opacity-[0.15] blur transition duration-500 group-hover:opacity-30"></div>

            <form
              onSubmit={handleSearchSubmit}
              className="relative flex flex-col items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white/90 p-1.5 shadow-xl shadow-[#2563eb]/[0.03] backdrop-blur-xl transition-all focus-within:border-[#2563eb]/50 focus-within:ring-4 focus-within:ring-[#2563eb]/10 md:flex-row dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div className="relative flex flex-1 items-center gap-3 border-b border-slate-100 px-5 py-3 md:border-r md:border-b-0 md:py-0 dark:border-slate-800/80">
                <Search
                  size={22}
                  className="shrink-0 text-[#2563eb] dark:text-[#60a5fa]"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Job title, skill, or keyword"
                  className="w-full bg-transparent pr-12 text-[17px] font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="absolute top-1/2 right-3 hidden -translate-y-1/2 md:flex">
                  <kbd className="pointer-events-none inline-flex h-6 items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2 font-mono text-[11px] font-medium text-slate-500 select-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-3 px-5 py-3 md:py-0">
                <MapPin
                  size={22}
                  className="shrink-0 text-[#2563eb] dark:text-[#60a5fa]"
                />
                <input
                  type="text"
                  placeholder="City, state, or 'Remote'"
                  className="w-full bg-transparent text-[17px] font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="m-1 w-full md:my-1 md:mr-1 md:ml-0 md:w-auto"
              >
                Search Now
                <ArrowRight size={18} />
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
