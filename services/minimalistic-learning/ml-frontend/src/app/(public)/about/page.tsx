"use client";

import { useEffect, useRef, useState } from "react";
import {
  Shield, Zap, Globe, Target, Users, Star, ArrowRight, CheckCircle, Lightbulb
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ─── Scroll-reveal hook ─────────────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Small delay ensures the initial CSS (opacity 0) is painted before transitioning
          setTimeout(() => setVisible(true), 50);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

/* ─── Reveal wrapper ─────────────────────────────────────────────────── */
function Reveal({
  children, delay = 0, direction, dir, className = ""
}: {
  children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right" | "fade"; dir?: "up" | "left" | "right" | "fade"; className?: string
}) {
  const finalDir = dir || direction || "up";
  const { ref, visible } = useScrollReveal();
  const transforms: Record<string, string> = {
    up: "translateY(30px)",
    left: "translateX(-30px)",
    right: "translateX(30px)",
    fade: "scale(0.95)",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0px,0px) scale(1)" : transforms[finalDir],
        transition: `opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms, transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms`,
        willChange: "opacity, transform"
      }}
    >
      {children}
    </div>
  );
}

/* ─── Animated Counter ───────────────────────────────────────────────── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useScrollReveal();

  useEffect(() => {
    if (!visible) return;
    let cur = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(cur);
    }, 30);
    return () => clearInterval(t);
  }, [visible, target]);

  return <span ref={ref} className="tabular-nums">{count.toLocaleString()}{suffix}</span>;
}

/* ─── Page data ──────────────────────────────────────────────────────── */
const STATS = [
  { value: 12000, suffix: "+", label: "Active Learners" },
  { value: 98, suffix: "%", label: "Completion Rate" },
  { value: 350, suffix: "+", label: "Curated Guides" },
  { value: 40, suffix: "+", label: "Expert Authors" },
];

const VALUES = [
  { icon: Shield, title: "Uncompromising Quality", desc: "Every article is rigorously reviewed. We prioritize depth, accuracy, and absolute clarity over sheer volume." },
  { icon: Zap, title: "Zero Friction", desc: "No ads, no popups, no dark patterns. We designed a platform that respects your time and your attention." },
  { icon: Users, title: "Elite Community", desc: "Surround yourself with driven peers. Growth accelerates when you immerse in a network of dedicated builders." },
  { icon: Target, title: "Goal-Oriented", desc: "Reading should yield results. Our resources are deeply actionable and meant to be applied in the real world." },
  { icon: Globe, title: "Global Perspective", desc: "Diverse authors cross-pollinate ideas from different regions, creating a truly global learning standard." },
  { icon: Lightbulb, title: "Continuous Evolution", desc: "Our curriculum adapts to modern tech. We constantly refine our resources to keep you at the sharpest edge." },
];

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <main className="flex-1 overflow-hidden bg-background">

      {/* ── CLEAN HERO ───────────────────────────────────────────────── */}
      <section className="relative w-full pt-6 pb-24 md:pt-10 md:pb-32 lg:pt-12 lg:pb-40 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

        {/* Soft Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-theme-action/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-theme-accent)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-theme-accent)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_10%,transparent_100%)] opacity-5 pointer-events-none -z-10"></div>

        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <Reveal delay={0} direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-theme-element-sec border border-theme-accent/20 shadow-sm mb-8">
              <div className="w-2 h-2 rounded-full bg-theme-action"></div>
              <span className="text-[11px] font-bold text-foreground/80 uppercase tracking-widest leading-none mt-0.5">Who We Are</span>
            </div>
          </Reveal>

          <Reveal delay={100} direction="up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tighter leading-[1.05] mb-6 drop-shadow-sm">
              The Platform Engineered <br className="hidden md:block" /> for Absolute <span className="text-theme-action">Focus.</span>
            </h1>
          </Reveal>

          <Reveal delay={200} direction="up">
            <p className="text-foreground/70 font-medium text-lg md:text-xl leading-relaxed max-w-2xl text-balance mb-10">
              Modern the web is loud. We built Minimalistic Learning as the ultimate quiet place—stripping away every distraction until only pure, actionable knowledge remains.
            </p>
          </Reveal>

          <Reveal delay={300} direction="up">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
              <Link href="/blog" className="w-full sm:w-auto px-8 py-3.5 bg-foreground text-background rounded-xl font-black text-sm hover:-translate-y-1 hover:shadow-lg transition-all flex items-center justify-center gap-2 group">
                Explore Content
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/register" className="w-full sm:w-auto px-8 py-3.5 bg-theme-element-sec border border-theme-accent/20 text-foreground rounded-xl font-bold text-sm hover:border-theme-action/40 transition-all text-center">
                Join Community
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SLEEK STATS STRIP ────────────────────────────────────────── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-32">
        <Reveal delay={400} direction="up">
          <div className="max-w-6xl mx-auto rounded-3xl bg-theme-element-sec shadow-sm border border-theme-accent/15 divide-y md:divide-y-0 md:divide-x divide-theme-accent/10 flex flex-col md:flex-row">
            {STATS.map((s, i) => (
              <div key={i} className="flex-1 px-8 py-10 flex flex-col items-center justify-center text-center group">
                <p className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter mb-2 group-hover:scale-105 transition-transform duration-300">
                  <Counter target={s.value} suffix={s.suffix} />
                </p>
                <p className="text-[11px] font-bold text-theme-action uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── PHILOSOPHY (Z-PATTERN) ───────────────────────────────────── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-24 bg-theme-element border-y border-theme-accent/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          <Reveal direction="left" className="order-2 lg:order-1">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-theme-accent/20 bg-theme-element-sec group">
              <div className="absolute inset-0 bg-theme-action/5 mix-blend-overlay group-hover:bg-transparent transition-colors duration-500 z-10"></div>
              <Image
                src="/focus_zone_about.png"
                alt="Workspace engineered for focus"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </Reveal>

          <Reveal direction="right" className="order-1 lg:order-2">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-tight mb-6">
                Redefining the <br /> <span className="text-theme-action">Learning Edge.</span>
              </h2>
              <p className="text-foreground/70 font-medium text-base sm:text-lg leading-relaxed mb-8">
                The prevailing model of online education is flawed. Subscriptions trap you, notifications distract you, and infinite scrolling feeds paralyze you. We built this platform as an antidote. A space strictly reserved for high-signal, zero-noise engineering and design education.
              </p>

              <ul className="space-y-4">
                {[
                  "No intrusive advertisements or paywalls.",
                  "Clean, readable typography on every device.",
                  "Community-vetted, expert-authored insights."
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-0.5 rounded-full bg-theme-action/10 p-1 text-theme-action shrink-0">
                      <CheckCircle size={16} />
                    </div>
                    <span className="text-foreground/80 font-bold text-sm sm:text-base leading-snug">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ── CORE VALUES GRID ─────────────────────────────────────────── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-32 bg-background">
        <div className="max-w-6xl mx-auto">
          <Reveal direction="up">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tighter mb-4">Our Core Values</h2>
              <p className="text-foreground/70 font-medium text-lg max-w-2xl mx-auto">The unshakeable principles that guide everything we build, design, and write.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-[minmax(0,_1fr)]">
            {VALUES.map((val, i) => (
              <Reveal key={i} delay={i * 50} direction="up" className="h-full">
                <div className="h-full p-8 rounded-3xl bg-theme-element-sec border border-theme-accent/20 hover:border-theme-action/30 hover:shadow-lg transition-all duration-300 flex flex-col group">
                  <div className="w-14 h-14 rounded-2xl bg-background border border-theme-accent/15 flex items-center justify-center text-foreground mb-6 shadow-sm group-hover:bg-theme-action group-hover:text-white group-hover:border-theme-action group-hover:-rotate-3 transition-all duration-300 shrink-0">
                    <val.icon size={24} />
                  </div>
                  <h3 className="text-xl font-black text-foreground tracking-tight mb-3">{val.title}</h3>
                  <p className="text-foreground/70 text-sm font-medium leading-relaxed">{val.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-32">
        <Reveal direction="up">
          <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-foreground text-background px-8 py-16 text-center shadow-2xl relative overflow-hidden flex flex-col items-center group">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-theme-action/40 blur-[120px] rounded-full group-hover:bg-blue-400/50 transition-colors duration-1000"></div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tighter">Ready to focus?</h2>
              <p className="text-background/80 text-lg font-medium max-w-md mx-auto mb-10">
                Join thousands of developers learning without the noise.
              </p>
              <Link href="/register" className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-theme-action text-white rounded-xl font-black text-sm lg:text-base hover:opacity-90 hover:-translate-y-1 transition-all shadow-xl shadow-theme-action/20">
                Join Minimalistic Free
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

    </main>
  );
}
