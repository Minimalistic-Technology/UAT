"use client"
import { motion } from "motion/react";
import { UserRound, Sparkles, Handshake, ArrowRight } from "lucide-react";

const STEPS = [
  {
    n: "01",
    title: "Build a profile that works for you.",
    desc: "Spend 3 minutes. Our AI extracts skills from your resume, auto-fills roles, and writes a crisp summary.",
    icon: UserRound,
  },
  {
    n: "02",
    title: "Get matched to roles that actually fit.",
    desc: "A fit score ranks every opening by your skills, goals, comp expectations and working style.",
    icon: Sparkles,
  },
  {
    n: "03",
    title: "Apply once. Hear back fast.",
    desc: "Employers on Hireloop commit to a 72-hour response SLA. No ghosting, guaranteed.",
    icon: Handshake,
  },
];

const EASE = [0.22, 1, 0.36, 1];

export const HowItWorks = () => {
  return (
    <section
      id="how"
      className="relative py-24 md:py-32 bg-white overflow-hidden"
      data-testid="how-it-works-section"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 [background-image:radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="relative max-w-[88rem] mx-auto px-6 md:px-12">
        <div className="max-w-2xl mb-20">
          <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-black text-indigo-600">
            How it works
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl mt-4 text-slate-900 font-bold tracking-tight leading-[1.1]">
            Three steps. <br />
            <span className="text-indigo-600">Zero recruiter noise.</span>
          </h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          className="grid md:grid-cols-3 gap-8 md:gap-12"
        >
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.n}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: EASE },
                  },
                }}
                className="group relative"
                data-testid={`step-${step.n}`}
              >
                {/* Connector line for desktop */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-[2px] bg-slate-100 -z-10">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-indigo-100" 
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mb-8">
                  <div className="relative">
                    <span className="text-6xl font-black text-slate-50 group-hover:text-indigo-50 transition-colors duration-500 select-none">
                      {step.n}
                    </span>
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                      <Icon size={24} />
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-slate-600 leading-relaxed text-lg">
                    {step.desc}
                  </p>
                </div>
                
                <div className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                  Learn more <ArrowRight size={16} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};