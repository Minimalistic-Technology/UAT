"use client";
import { motion } from "motion/react";
import Link from "next/link";
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
    <section className="bg-white py-24" data-testid="categories-section">
      <div className="mx-auto max-w-[88rem] px-6 md:px-12">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase md:text-xs">
              Explore
            </span>
            <h2 className="mt-3 text-4xl leading-[1.1] font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Browse jobs by <span className="text-blue-600">category.</span>
            </h2>
          </div>
          <Link
            href="/find-jobs"
            className="group inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition-colors hover:text-blue-600"
            data-testid="view-all-categories"
          >
            Explore all jobs
            <ArrowUpRight
              size={18}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
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
          className="grid grid-cols-2 overflow-hidden rounded-2xl border-t border-l border-slate-200 shadow-sm md:grid-cols-3 lg:grid-cols-4"
        >
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isPurple = category.accent === "purple";

            return (
              <motion.a
                key={category.label}
                href={`/find-jobs?search=${encodeURIComponent(category.label)}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: "easeInOut" },
                  },
                }}
                className="group relative border-r border-b border-slate-200 bg-white p-8 transition-all duration-300 hover:bg-slate-50 md:p-10"
                aria-label={`View ${category.label} jobs`}
              >
                {/* Icon Container */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                    isPurple
                      ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                      : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                  }`}
                >
                  <Icon size={24} strokeWidth={2} />
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                    {category.label}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {category.count} open roles
                  </p>
                </div>

                {/* Hover Reveal Arrow */}
                <div className="absolute top-6 right-6 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight size={20} className="text-blue-600" />
                </div>
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
