"use client"
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
      className="relative pt-8 pb-16 md:pt-12 md:pb-24 overflow-hidden bg-white dark:bg-[#0A0F1C] transition-colors duration-300 border-b border-slate-100 dark:border-slate-800/50"
      data-testid="hero-section"
    >
      {/* Decorative Premium Glows */}
      <div
        className="absolute rounded-full blur-[140px] opacity-[0.15] dark:opacity-20 bg-[#2563eb] w-[600px] h-[600px] -top-32 -left-32 -z-10 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute rounded-full blur-[120px] opacity-[0.1] dark:opacity-[0.15] bg-[#00c8ff] w-[500px] h-[500px] top-40 right-[-100px] -z-10 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[88rem] mx-auto px-6 md:px-12 w-full flex-1 flex flex-col items-center">
        <div className="flex flex-col items-center text-center w-full max-w-5xl mx-auto">

          {/* Top Pill / Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 text-[#2563eb] dark:text-[#60a5fa] text-[11px] font-bold tracking-widest uppercase mb-10 shadow-sm backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563eb] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563eb]"></span>
            </span>
            <span className="mt-px">Over 10,000 top companies hiring</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-black leading-[1.1] text-slate-900 dark:text-white tracking-tight"
          >
            Find work that{" "}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#2563eb] to-[#00d4ff]">
              actually
              <svg
                viewBox="0 0 300 14"
                className="absolute left-0 right-0 -bottom-1 lg:-bottom-2 w-full"
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
            </span>
            {" "}moves you.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="mt-8 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed mx-auto font-medium"
          >
            Search through 12,000+ vetted opportunities from top startups and Fortune 500s. No recruiter spam. No ghosting. Just exact matches.
          </motion.p>

          {/* Glass Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="mt-14 w-full max-w-4xl mx-auto relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563eb] to-[#00d4ff] rounded-[2rem] blur opacity-[0.15] group-hover:opacity-30 transition duration-500"></div>

            <form
              onSubmit={handleSearchSubmit}
              className="relative flex flex-col md:flex-row items-stretch bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800 focus-within:border-[#2563eb]/50 focus-within:ring-4 focus-within:ring-[#2563eb]/10 rounded-[2rem] overflow-hidden transition-all shadow-xl shadow-[#2563eb]/[0.03] p-1.5"
            >
              <div className="relative flex items-center gap-3 flex-1 px-5 py-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/80">
                <Search size={22} className="text-[#2563eb] dark:text-[#60a5fa] shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Job title, skill, or keyword"
                  className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-[17px] font-medium pr-12"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex">
                  <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 px-5 py-4">
                <MapPin size={22} className="text-[#2563eb] dark:text-[#60a5fa] shrink-0" />
                <input
                  type="text"
                  placeholder="City, state, or 'Remote'"
                  className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-[17px] font-medium"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="m-1 md:my-1 md:ml-0 md:mr-1 h-14 px-10 text-[17px] font-bold rounded-full"
              >
                Search Now
                <ArrowRight size={20} />
              </Button>
            </form>
          </motion.div>



        </div>
      </div>
    </section>
  );
};