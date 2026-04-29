"use client"
import { motion } from "motion/react";
import {
  Code2,
  Palette,
  LineChart,
  Megaphone,
  Briefcase,
  Headphones,
  Server,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

const CATEGORIES = [
  { label: "Engineering", count: "3,214", icon: Code2, accent: "purple" },
  { label: "Design", count: "982", icon: Palette, accent: "blue" },
  { label: "Data & AI", count: "1,406", icon: Sparkles, accent: "purple" },
  { label: "Marketing", count: "612", icon: Megaphone, accent: "blue" },
  { label: "Sales", count: "889", icon: LineChart, accent: "purple" },
  { label: "Operations", count: "544", icon: Briefcase, accent: "blue" },
  { label: "Support", count: "331", icon: Headphones, accent: "purple" },
  { label: "DevOps", count: "276", icon: Server, accent: "blue" },
];

const EASE = [0.22, 1, 0.36, 1];

export const Categories = () => {
  return (
    <section
      className="py-24 md:py-32 bg-white"
      data-testid="categories-section"
    >
      <div className="max-w-[88rem] mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-black text-indigo-600">
              Explore
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl mt-3 text-slate-900 font-bold tracking-tight leading-[1.1]">
              Browse jobs by <span className="text-indigo-600">category.</span>
            </h2>
          </div>
          <a
            href="/categories"
            className="group inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition-colors hover:text-indigo-600"
            data-testid="view-all-categories"
          >
            View all categories 
            <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* Categories Grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            show: {
              transition: { staggerChildren: 0.04, delayChildren: 0.1 },
            },
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-l border-t border-slate-200 rounded-2xl overflow-hidden shadow-sm"
        >
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isPurple = category.accent === "purple";
            
            return (
              <motion.a
                key={category.label}
                href={`/jobs/${category.label.toLowerCase()}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: "easeInOut" },
                  },
                }}
                className="group relative p-8 md:p-10 bg-white hover:bg-slate-50 border-r border-b border-slate-200 transition-all duration-300"
                aria-label={`View ${category.label} jobs`}
              >
                {/* Icon Container */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isPurple
                      ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                      : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                  }`}
                >
                  <Icon size={24} strokeWidth={2} />
                </div>

                <div className="mt-8">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                    {category.label}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 font-medium">
                    {category.count} open roles
                  </p>
                </div>

                {/* Hover Reveal Arrow */}
                <div className="absolute top-6 right-6 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <ArrowUpRight size={20} className="text-indigo-600" />
                </div>
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};