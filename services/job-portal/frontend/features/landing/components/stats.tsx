"use client"
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
      className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white"
    >
      {val.toLocaleString()}
      <span className="text-blue-400 ml-1">{suffix}</span>
    </span>
  );
};

export default Counter;

export const Stats = () => {
  return (
    <section
      className="py-24 md:py-32 bg-slate-950 relative overflow-hidden"
      data-testid="stats-section"
    >
      {/* Visual Decorations */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none [background-image:linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:40px_40px]" 
        aria-hidden="true"
      />
      
      {/* Decorative Orbs - Using Tailwind instead of missing custom classes */}
      <div
        className="absolute rounded-full blur-[120px] bg-indigo-600/20 w-[480px] h-[480px] -top-40 left-1/4"
        aria-hidden="true"
      />
      <div
        className="absolute rounded-full blur-[100px] bg-blue-600/20 w-[420px] h-[420px] -bottom-32 right-1/3"
        aria-hidden="true"
      />

      <div className="relative max-w-[88rem] mx-auto px-6 md:px-12">
        <div className="max-w-2xl mb-16 md:mb-24">
          <span className="text-[10px] md:text-xs tracking-[0.24em] uppercase font-black text-blue-400">
            By the numbers
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl mt-4 text-white font-bold leading-tight tracking-tight">
            Momentum, <span className="text-slate-400">measured.</span>
          </h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ 
            show: { transition: { staggerChildren: 0.1 } } 
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16 md:gap-6"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="flex flex-col relative"
              data-testid={`stat-${i}`}
            >
              <Counter to={stat.value} suffix={stat.suffix} />
              <div className="mt-4 text-sm md:text-base font-medium text-slate-400 uppercase tracking-widest max-w-[14rem]">
                {stat.label}
              </div>
              
              {/* Subtle accent border for desktop */}
              <div className="hidden md:block absolute -left-4 top-2 bottom-2 w-[1px] bg-gradient-to-b from-transparent via-slate-800 to-transparent" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};