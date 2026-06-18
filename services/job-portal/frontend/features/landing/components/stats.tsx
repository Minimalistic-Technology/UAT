"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

type CounterProps = {
  to: number;
  suffix?: string;
};

const STATS = [
  { value: 12804, suffix: "+", label: "Jobs posted this week" },
  { value: 3200, suffix: "+", label: "Hiring companies" },
  { value: 72, suffix: "h", label: "Avg. response time" },
  { value: 94, suffix: "%", label: "Candidate match rate" },
  { value: 50, suffix: "k+", label: "Active users" },
  { value: 99, suffix: "%", label: "Satisfaction rate" },
];

const Counter = ({ to, suffix = "" }: CounterProps) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const [val, setVal] = useState<number>(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 2000;
    const start = performance.now();
    let raf: number;

    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);

      // Cubic ease-out
      const eased = 1 - Math.pow(1 - p, 3);

      setVal(Math.round(to * eased));

      if (p < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span
      ref={ref}
      className="text-5xl font-bold tracking-tighter text-white md:text-6xl lg:text-7xl"
    >
      {val.toLocaleString()}
      <span className="ml-1 text-blue-400">{suffix}</span>
    </span>
  );
};

export default Counter;

export const Stats = () => {
  return (
    <section
      className="relative overflow-hidden bg-slate-950 py-24 md:py-32"
      data-testid="stats-section"
    >
      {/* Visual Decorations */}
      <div
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-10"
        aria-hidden="true"
      />

      {/* Decorative Orbs - Using Tailwind instead of missing custom classes */}
      <div
        className="absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-blue-600/20 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="absolute right-1/3 -bottom-32 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[88rem] px-6 md:px-12">
        <div className="mb-16 max-w-2xl md:mb-24">
          <span className="text-[10px] font-black tracking-[0.24em] text-blue-400 uppercase md:text-xs">
            By the numbers
          </span>
          <h2 className="mt-4 text-4xl leading-tight font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Momentum, <span className="text-slate-400">measured.</span>
          </h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            show: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-2 gap-x-8 gap-y-16 md:grid-cols-4 md:gap-6"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="relative flex flex-col"
              data-testid={`stat-${i}`}
            >
              <Counter to={stat.value} suffix={stat.suffix} />
              <div className="mt-4 max-w-[14rem] text-sm font-medium tracking-widest text-slate-400 uppercase md:text-base">
                {stat.label}
              </div>

              {/* Subtle accent border for desktop */}
              <div className="absolute top-2 bottom-2 -left-4 hidden w-[1px] bg-gradient-to-b from-transparent via-slate-800 to-transparent md:block" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
