"use client";
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
    details:
      "Your profile is your digital resume. With our AI, you don't need to manually type everything. Just upload your existing resume, and our system will accurately extract your past experiences, summarize your strengths, and highlight your top skills. By setting up a complete profile, you increase your visibility to top employers looking for exactly what you offer.",
  },
  {
    n: "02",
    title: "Get matched to roles that actually fit.",
    desc: "A fit score ranks every opening by your skills, goals, comp expectations and working style.",
    icon: Sparkles,
    details:
      "Stop scrolling through thousands of irrelevant jobs. We use an advanced matching algorithm that compares your skills, salary expectations, and preferred working style with every open role on the platform. You'll receive a personalized 'Fit Score' for each job, ensuring you only spend time on opportunities where you're highly likely to succeed.",
  },
  {
    n: "03",
    title: "Apply once. Hear back fast.",
    desc: "Employers on Hireloop commit to a 72-hour response SLA. No ghosting, guaranteed.",
    icon: Handshake,
    details:
      "The hiring process shouldn't be a black hole. When you apply through our platform, employers are committed to a Service Level Agreement (SLA) to respond within 72 hours. Whether it's an interview request or a polite rejection, you will always know where you stand. Say goodbye to the anxiety of ghosting.",
  },
];

const EASE = [0.22, 1, 0.36, 1];

export const HowItWorks = () => {
  return (
    <section
      id="how"
      className="relative overflow-hidden bg-white py-24 md:py-32"
      data-testid="how-it-works-section"
    >
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-full w-full -translate-x-1/2 opacity-[0.03]"
        aria-hidden="true"
      >
        <div className="absolute inset-0 [background-image:radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="relative mx-auto max-w-[88rem] px-6 md:px-12">
        <div className="mb-20 max-w-2xl">
          <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase md:text-xs">
            How it works
          </span>
          <h2 className="mt-4 text-4xl leading-[1.1] font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Three steps. <br />
            <span className="text-blue-600">Zero recruiter noise.</span>
          </h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          className="grid gap-8 md:grid-cols-3 md:gap-12"
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
                  <div className="absolute top-7 left-20 -z-10 hidden h-[2px] w-[calc(100%-3rem)] bg-slate-100 md:block">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-blue-100"
                    />
                  </div>
                )}

                <div className="mb-8 flex items-center gap-5">
                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-200 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    <Icon size={28} />
                  </div>
                  <span className="text-5xl font-black text-slate-300 transition-colors duration-300 select-none group-hover:text-blue-300">
                    {step.n}
                  </span>
                </div>

                <div className="p-2">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-lg leading-relaxed text-slate-600">
                    {step.desc}
                  </p>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      className="mt-6 flex h-auto translate-x-[-10px] cursor-pointer items-center gap-2 p-0 text-sm font-bold text-indigo-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    >
                      Learn more <ArrowRight size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="overflow-hidden p-0 sm:max-w-md md:max-w-lg">
                    <DialogHeader className="border-b border-slate-100 bg-slate-50 p-6">
                      <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                          <Icon size={24} />
                        </div>
                        <span>
                          <span className="mr-2 text-lg text-indigo-600">
                            Step {step.n}
                          </span>
                          <br />
                          {step.title}
                        </span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="p-6 md:p-8">
                      <p className="mb-4 text-lg leading-relaxed font-medium text-slate-600">
                        {step.desc}
                      </p>
                      <div className="rounded-2xl border border-indigo-100/50 bg-indigo-50/50 p-5">
                        <p className="text-base leading-relaxed text-slate-700">
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
