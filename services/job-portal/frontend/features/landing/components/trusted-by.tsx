"use client"
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
              key={`${company.name}-${i}`}
              className="flex items-center gap-3 shrink-0 cursor-default group/logo"
            >
              <div
                className="w-10 h-10 bg-slate-400 dark:bg-slate-600 group-hover/logo:bg-[#2563eb] transition-colors duration-500"
                style={{
                  maskImage: `url(https://cdn.simpleicons.org/${company.slug})`,
                  WebkitMaskImage: `url(https://cdn.simpleicons.org/${company.slug})`,
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                }}
                aria-hidden="true"
              />
              <span className="text-2xl md:text-3xl font-bold text-slate-500 group-hover/logo:text-[#2563eb] transition-colors tracking-tighter">
                {company.name}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Improved Edge Fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-32 bg-gradient-to-r from-slate-50/90 dark:from-slate-950/90 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-32 bg-gradient-to-l from-slate-50/90 dark:from-slate-950/90 to-transparent z-10" />
      </div>
    </section>
  );
};