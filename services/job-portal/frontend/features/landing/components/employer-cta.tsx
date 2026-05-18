"use client"
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const BG_URL =
  "https://static.prod-images.emergentagent.com/jobs/87777c5c-7e2c-4061-8282-ba379018b5d9/images/d502f0b7342dfdd8180285c187d04afae3a471f4d2c6560b7c4943fac5d7492d.png";

const PERKS = [
  "Get qualified applicants in 48 hours",
  "Cut time-to-hire by up to 41%",
  "Free to post. Pay only on hires.",
];

const EASE = [0.22, 1, 0.36, 1];

export const EmployerCTA = () => {
  const router = useRouter();
  return (
    <section
      id="employers"
      className="py-24 md:py-32 bg-slate-50"
      data-testid="employer-cta-section"
    >
      <div className="max-w-[88rem] mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeIn" }}
          className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-200/50"
        >
          {/* Decorative Background Layers */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.15] mix-blend-multiply"
            style={{ backgroundImage: `url(${BG_URL})` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-indigo-50/30" aria-hidden="true" />
          <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden="true" />

          <div className="relative grid lg:grid-cols-12 gap-12 p-8 md:p-16 lg:p-20 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-black text-indigo-600">
                For Employers
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl mt-4 text-slate-900 font-bold leading-[1.1] tracking-tight">
                Hire people <br />
                who do the <span className="text-indigo-600">work.</span>
              </h2>
              <p className="mt-8 text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
                Skip the 400-resume pile. Our matching engine surfaces the top
                2% of candidates for your role — with real portfolios, code
                samples, and work history.
              </p>

              <ul className="mt-10 space-y-4">
                {PERKS.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-center gap-3 text-slate-900 font-semibold"
                  >
                    <CheckCircle2
                      size={22}
                      className="text-indigo-600 shrink-0"
                    />
                    {perk}
                  </li>
                ))}
              </ul>

              <div className="mt-12 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/employer-dashboard/jobs/create")}
                  className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 flex items-center gap-2"
                  data-testid="post-job-cta-button"
                >
                  Post a job — free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/employer-register")}
                  className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 font-bold rounded-2xl transition-all duration-300"
                  data-testid="talk-to-sales-button"
                >
                  Talk to sales
                </button>
              </div>
            </div>

            {/* Right Card / Social Proof */}
            <div className="lg:col-span-5">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-slate-950 rounded-[2rem] p-10 text-white shadow-2xl shadow-slate-900/40 relative"
              >
                {/* Status Indicator */}
                <div className="flex items-center justify-between mb-8">
                  <div className="px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-[10px] font-black tracking-widest uppercase text-blue-400">
                    Verified Result
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    3 hires this hour
                  </div>
                </div>

                <blockquote className="text-2xl md:text-3xl font-medium leading-snug tracking-tight italic">
                  “We filled 3 senior roles in under 10 days.”
                </blockquote>

                <div className="mt-10 pt-8 border-t border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-xl shadow-lg">
                    R
                  </div>
                  <div>
                    <div className="font-bold text-lg">Renu K.</div>
                    <div className="text-sm font-medium text-slate-500">
                      Head of People, Mercury
                    </div>
                  </div>
                </div>

                {/* Decorative corner element */}
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <CheckCircle2 size={120} />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};