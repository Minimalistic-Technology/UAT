"use client"
import { motion } from "motion/react";

const COMPANIES = [
  "Linear",
  "Vercel",
  "Figma",
  "Stripe",
  "Notion",
  "Ramp",
  "Shopify",
  "Airbnb",
  "Retool",
  "Plaid",
  "Intercom",
  "Mercury",
];

export const TrustedBy = () => {
  // We double the array to ensure a seamless infinite loop
  const duplicatedCompanies = [...COMPANIES, ...COMPANIES];

  return (
    <section
      id="companies"
      className="py-16 md:py-24 border-y border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 overflow-hidden transition-colors duration-300"
      aria-label="Trusted by"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-[10px] md:text-xs tracking-[0.24em] uppercase font-black text-slate-400">
          Trusted by world-class teams
        </h2>
      </motion.div>

      <div className="relative group">
        {/* The Marquee Track */}
        <motion.div
          className="flex w-max gap-16 md:gap-24 items-center"
          animate={{
            x: ["0%", "-50%"], // Moves halfway because the list is duplicated
          }}
          transition={{
            ease: "linear",
            duration: 35, // Adjust speed here
            repeat: Infinity,
          }}
        >
          {duplicatedCompanies.map((company, i) => (
            <div
              key={`${company}-${i}`}
              className="flex items-center gap-3 shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-600" aria-hidden="true" />
              <span className="text-2xl md:text-3xl font-bold text-slate-500 tracking-tighter">
                {company}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Improved Edge Fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10" />
      </div>
    </section>
  );
};