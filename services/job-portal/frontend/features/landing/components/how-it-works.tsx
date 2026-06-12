"use client"
import { motion } from "motion/react";
import { UserRound, Sparkles, Handshake, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    n: "01",
    title: "Build a profile that works for you.",
    desc: "Spend 3 minutes. Our AI extracts skills from your resume, auto-fills roles, and writes a crisp summary.",
    icon: UserRound,
    details: "Your profile is your digital resume. With our AI, you don't need to manually type everything. Just upload your existing resume, and our system will accurately extract your past experiences, summarize your strengths, and highlight your top skills. By setting up a complete profile, you increase your visibility to top employers looking for exactly what you offer.",
  },
  {
    n: "02",
    title: "Get matched to roles that actually fit.",
    desc: "A fit score ranks every opening by your skills, goals, comp expectations and working style.",
    icon: Sparkles,
    details: "Stop scrolling through thousands of irrelevant jobs. We use an advanced matching algorithm that compares your skills, salary expectations, and preferred working style with every open role on the platform. You'll receive a personalized 'Fit Score' for each job, ensuring you only spend time on opportunities where you're highly likely to succeed.",
  },
  {
    n: "03",
    title: "Apply once. Hear back fast.",
    desc: "Employers on Hireloop commit to a 72-hour response SLA. No ghosting, guaranteed.",
    icon: Handshake,
    details: "The hiring process shouldn't be a black hole. When you apply through our platform, employers are committed to a Service Level Agreement (SLA) to respond within 72 hours. Whether it's an interview request or a polite rejection, you will always know where you stand. Say goodbye to the anxiety of ghosting.",
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
          <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-black text-blue-600">
            How it works
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl mt-4 text-slate-900 font-bold tracking-tight leading-[1.1]">
            Three steps. <br />
            <span className="text-blue-600">Zero recruiter noise.</span>
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
                    transition: { duration: 0.8, ease: "easeIn" },
                  },
                }}
                className="group relative"
                data-testid={`step-${step.n}`}
              >
                {/* Connector line for desktop */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-20 w-[calc(100%-3rem)] h-[2px] bg-slate-100 -z-10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-blue-100"
                    />
                  </div>
                )}

                <div className="flex items-center gap-5 mb-8">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-200 transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-300 relative z-10">
                    <Icon size={28} />
                  </div>
                  <span className="text-5xl font-black text-slate-300 group-hover:text-blue-300 transition-colors duration-300 select-none">
                    {step.n}
                  </span>
                </div>

                <div className="p-2">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-slate-600 leading-relaxed text-lg">
                    {step.desc}
                  </p>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 cursor-pointer p-0 h-auto">
                      Learn more <ArrowRight size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md md:max-w-lg p-0 overflow-hidden">
                    <DialogHeader className="bg-slate-50 border-b border-slate-100 p-6">
                      <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <Icon size={24} />
                        </div>
                        <span>
                          <span className="text-indigo-600 mr-2 text-lg">Step {step.n}</span>
                          <br />
                          {step.title}
                        </span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="p-6 md:p-8">
                      <p className="text-slate-600 leading-relaxed text-lg font-medium mb-4">
                        {step.desc}
                      </p>
                      <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50">
                        <p className="text-slate-700 leading-relaxed text-base">
                          {step.details}
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};