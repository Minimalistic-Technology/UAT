"use client";
import { motion } from "motion/react";

const COMPANIES = [
  { name: "Linear", slug: "linear" },
  { name: "Vercel", slug: "vercel" },
  { name: "Figma", slug: "figma" },
  { name: "Stripe", slug: "stripe" },
  { name: "Notion", slug: "notion" },
  { name: "Shopify", slug: "shopify" },
  { name: "Airbnb", slug: "airbnb" },
  { name: "GitHub", slug: "github" },
  { name: "Discord", slug: "discord" },
  { name: "Spotify", slug: "spotify" },
  { name: "Netflix", slug: "netflix" },
];

export const TrustedBy = () => {
  // We double the array to ensure a seamless infinite loop
  const duplicatedCompanies = [...COMPANIES, ...COMPANIES];

  return (
    <section
      id="companies"
      className="overflow-hidden border-y border-slate-200 bg-slate-50/50 py-16 transition-colors duration-300 md:py-24 dark:border-slate-800 dark:bg-slate-950"
      aria-label="Trusted by"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <h2 className="text-[10px] font-black tracking-[0.24em] text-slate-400 uppercase md:text-xs">
          Trusted by world-class teams
        </h2>
      </motion.div>

      <div className="group relative">
        {/* The Marquee Track */}
        <motion.div
          className="flex w-max items-center gap-16 md:gap-24"
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
              key={`${company.name}-${i}`}
              className="group/logo flex shrink-0 cursor-default items-center gap-3"
            >
              <div
                className="h-10 w-10 bg-slate-400 transition-colors duration-500 group-hover/logo:bg-[#2563eb] dark:bg-slate-600"
                style={{
                  maskImage: `url(https://cdn.simpleicons.org/${company.slug})`,
                  WebkitMaskImage: `url(https://cdn.simpleicons.org/${company.slug})`,
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                }}
                aria-hidden="true"
              />
              <span className="text-2xl font-bold tracking-tighter text-slate-500 transition-colors group-hover/logo:text-[#2563eb] md:text-3xl">
                {company.name}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Improved Edge Fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-slate-50/90 to-transparent md:w-32 dark:from-slate-950/90" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-slate-50/90 to-transparent md:w-32 dark:from-slate-950/90" />
      </div>
    </section>
  );
};
