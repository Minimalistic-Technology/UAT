"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Zap,
  Shield,
  Users,
  Code,
  Terminal,
  Sparkles,
} from "lucide-react";
import GetStartedBtn from "./get-started";
import { api } from "@/lib/api";

/* ─── Deterministic particles ─── */
const PARTICLES = [
  { id: 0, size: 10, left: 8, top: 18, dur: 8, delay: 0 },
  { id: 1, size: 6, left: 18, top: 72, dur: 11, delay: 1.5 },
  { id: 2, size: 14, left: 30, top: 35, dur: 7, delay: 0.8 },
  { id: 3, size: 8, left: 48, top: 82, dur: 10, delay: 2 },
  { id: 4, size: 5, left: 62, top: 15, dur: 9, delay: 0.3 },
  { id: 5, size: 12, left: 75, top: 58, dur: 6, delay: 3 },
  { id: 6, size: 7, left: 88, top: 30, dur: 12, delay: 1 },
  { id: 7, size: 9, left: 92, top: 78, dur: 8, delay: 2.5 },
];

/* ─── Why-choose features ─────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Shield,
    title: "Focus on Core",
    desc: "We cut the noise so you can focus on what truly matters. Every article is hand-curated for depth, accuracy, and real-world value.",
    stat: "100%",
    statLabel: "Ad-free",
    color: "text-theme-action",
    bg: "bg-theme-element",
    border: "border-theme-accent/20",
  },
  {
    icon: Zap,
    title: "High Quality",
    desc: "Our editorial standards are uncompromising. Only content that adds genuine insight makes it through our curation process.",
    stat: "4.9★",
    statLabel: "Avg rating",
    color: "text-amber-500",
    bg: "bg-theme-element",
    border: "border-theme-accent/20",
  },
  {
    icon: Users,
    title: "Community Driven",
    desc: "Authors and readers build knowledge together. Get insightful feedback, discover collaborators, and grow alongside peers.",
    stat: "12k+",
    statLabel: "Members",
    color: "text-emerald-500",
    bg: "bg-theme-element",
    border: "border-theme-accent/20",
  },
];

/* ─── Keyframes injected client-only ─────────────────────────────────── */
const KF = `
 @keyframes floatUp {
 from { transform: translateY(0) rotate(0deg); opacity: 0.25; }
 to { transform: translateY(-24px) rotate(6deg); opacity: 0.7; }
 }
 @keyframes floatUI {
 0% { transform: translateY(0px) rotate(0deg); }
 50% { transform: translateY(-15px) rotate(1deg); }
 100% { transform: translateY(0px) rotate(0deg); }
 }
 @keyframes slideUp {
 from { opacity:0; transform: translateY(32px); }
 to { opacity:1; transform: translateY(0); }
 }
 @keyframes slideRight {
 from { opacity:0; transform: translateX(-32px); }
 to { opacity:1; transform: translateX(0); }
 }
 @keyframes pulse3d {
 0%,100% { transform: perspective(400px) rotateY(0deg) scale(1); }
 50% { transform: perspective(400px) rotateY(6deg) scale(1.03); }
 }
`;

/* ─── 3-D Tilt wrapper ───────────────────────────────────────────────── */
function Tilt({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    if (!el.current) return;
    const { left, top, width, height } = el.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    el.current.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale3d(1.04,1.04,1.04)`;
  };
  const leave = () => {
    if (el.current)
      el.current.style.transform =
        "perspective(700px) rotateY(0) rotateX(0) scale3d(1,1,1)";
  };
  return (
    <div
      ref={el}
      onMouseMove={move}
      onMouseLeave={leave}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Scroll-reveal ──────────────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  dir = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  dir?: "up" | "left" | "right" | "fade";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const t: Record<string, string> = {
    up: "translateY(36px)",
    left: "translateX(-36px)",
    right: "translateX(36px)",
    fade: "scale(0.95)",
  };
  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : t[dir],
        transition: `opacity .65s ease ${delay}ms, transform .65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Main Hero ──────────────────────────────────────────────────────── */
export const Hero = ({ previewData }: { previewData?: any }) => {
  // ✅ FIX: previewData ab page.tsx se aata hai — koi internal fetch nahi
  // Null hone pe default text use hoga (fallback already har field mein hai)
  const heroContent = previewData ?? null;

  useEffect(() => {
    const id = "hero-kf";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = KF;
    document.head.appendChild(s);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        className={`bg-background relative w-full overflow-hidden pt-8 pb-12 transition-colors duration-500 lg:pt-12 lg:pb-16`}
      >
        {/* Soft elegant gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,var(--color-element)_80%)] opacity-80 mix-blend-normal" />

        {/* Ambient Highlight Background */}
        <div className="bg-theme-action/20 pointer-events-none absolute top-[-10%] right-[-10%] h-[60%] w-[50%] rounded-full mix-blend-screen blur-[130px]" />
        <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[50%] w-[40%] rounded-full bg-purple-500/10 mix-blend-screen blur-[120px]" />

        {/* Floating particles */}
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="bg-theme-action/20 pointer-events-none absolute rounded-full"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animation: `floatUp ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
            }}
          />
        ))}

        {/* 2-COLUMN LAYOUT */}
        <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-8">
            {/* LEFT COLUMN: Content */}
            <div className="flex w-full flex-col items-center text-center lg:items-start lg:text-left">
              {/* Badge */}
              <div
                className="bg-theme-element-sec border-theme-accent/20 text-theme-action mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black tracking-widest uppercase shadow-sm backdrop-blur-md lg:mb-8"
                style={{ animation: "slideRight 0.6s ease both" }}
              >
                <Sparkles size={14} className="text-amber-500" />{" "}
                {heroContent?.badgeText || "Premium Learning Experience"}
              </div>

              <h1
                className="xs:text-5xl text-foreground mb-6 text-4xl leading-[1.1] font-black tracking-tighter drop-shadow-sm sm:text-6xl lg:text-[3.5rem] xl:text-[4.2rem] dark:drop-shadow-none"
                style={{ animation: "slideRight 0.7s 0.1s ease both" }}
              >
                {heroContent?.title || "Elevate your"}{" "}
                <span
                  className="from-theme-action bg-gradient-to-r to-purple-500 bg-clip-text text-transparent"
                  style={{ animation: "pulse3d 5s ease-in-out infinite" }}
                >
                  {heroContent?.highlight || "Knowledge"}
                </span>
                <br /> {heroContent?.bottomText || "Without Noise."}
              </h1>

              <p
                className="text-foreground/70 mx-auto mb-10 max-w-xl text-base leading-relaxed font-medium lg:mx-0 lg:text-lg"
                style={{ animation: "slideRight 0.7s 0.2s ease both" }}
              >
                {heroContent?.subtitle ||
                  "Welcome to Minimalistic Learning. A distraction-free platform where curious minds flourish. Master new tech skills with total clarity."}
              </p>

              <div
                className="flex w-full flex-wrap items-center justify-center gap-4 sm:gap-6 lg:justify-start"
                style={{ animation: "slideRight 0.7s 0.3s ease both" }}
              >
                <GetStartedBtn />
                <Link
                  href="/resources"
                  className="group bg-theme-element-sec text-foreground border-theme-accent/20 flex items-center gap-3 rounded-xl border px-8 py-3.5 text-sm font-black shadow-sm transition-all hover:shadow-lg"
                >
                  <div className="bg-background text-foreground border-theme-accent/10 flex h-7 w-7 items-center justify-center rounded-lg border">
                    <BookOpen size={13} fill="currentColor" />
                  </div>
                  Browse Hub
                  <ArrowRight
                    size={16}
                    className="text-foreground/50 group-hover:text-foreground transition-all group-hover:translate-x-1"
                  />
                </Link>
              </div>

              {/* User Trust small widget */}
              <div
                className="border-theme-accent/10 mt-12 flex w-full items-center justify-center gap-4 border-t pt-6 lg:justify-start"
                style={{ animation: "slideRight 0.7s 0.4s ease both" }}
              >
                <div className="flex -space-x-3">
                  <div className="border-background flex h-10 w-10 items-center justify-center rounded-full border-2 bg-blue-100 text-xs font-bold text-blue-600">
                    JD
                  </div>
                  <div className="border-background flex h-10 w-10 items-center justify-center rounded-full border-2 bg-emerald-100 text-xs font-bold text-emerald-600">
                    AS
                  </div>
                  <div className="border-background flex h-10 w-10 items-center justify-center rounded-full border-2 bg-purple-100 text-xs font-bold text-purple-600">
                    MK
                  </div>
                  <div className="border-background bg-theme-element-sec text-foreground/70 flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-black">
                    +12k
                  </div>
                </div>
                <p className="text-foreground/60 text-sm font-semibold">
                  <span className="text-foreground font-black">12,000+</span>{" "}
                  Developers joined
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Visual Glass Card */}
            <div
              className="relative mt-4 flex w-full justify-center sm:mt-8 lg:mt-0 lg:justify-end"
              style={{ animation: "slideUp 0.8s 0.2s ease both" }}
            >
              {/* Decorative Ring */}
              <div
                className="border-theme-accent/20 animate-spin-slow pointer-events-none absolute top-1/2 left-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed sm:h-[450px] sm:w-[450px] lg:h-[550px] lg:w-[550px]"
                style={{ animationDuration: "30s" }}
              ></div>

              {/* Main IDE Glass Card */}
              <div
                className="xs:max-w-[400px] relative z-10 mx-auto aspect-[4/3] w-full max-w-[95vw] sm:max-w-[500px] lg:mx-0 lg:max-w-[600px] xl:max-w-[650px]"
                style={{ animation: "floatUI 8s ease-in-out infinite" }}
              >
                <div className="from-theme-action/20 absolute inset-0 rounded-[2rem] bg-gradient-to-tr to-purple-500/20 blur-2xl" />

                <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white/60 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-black/60">
                  {/* Header */}
                  <div className="flex h-10 items-center justify-between border-b border-black/5 bg-black/5 px-4 sm:h-12 dark:border-white/5 dark:bg-white/5">
                    <div className="flex gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400 sm:h-3 sm:w-3" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400 sm:h-3 sm:w-3" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 sm:h-3 sm:w-3" />
                    </div>
                    <div className="text-foreground/40 flex items-center gap-2 rounded bg-black/5 px-2 py-1 font-mono text-[9px] font-bold tracking-widest uppercase sm:text-[10px] dark:bg-white/5">
                      <Terminal size={10} /> learn.ts
                    </div>
                  </div>
                  {/* Code Body */}
                  <div className="text-foreground/80 flex-1 space-y-3 p-5 font-mono text-[11px] sm:space-y-4 sm:p-6 sm:text-[13px] md:text-sm">
                    <p>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        import
                      </span>{" "}
                      {"{"}{" "}
                      <span className="text-blue-600 dark:text-blue-400">
                        Focus
                      </span>{" "}
                      {"}"}{" "}
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        from
                      </span>{" "}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        'minimal'
                      </span>
                      ;
                    </p>
                    <br className="hidden sm:block" />
                    <p>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        const
                      </span>{" "}
                      <span className="text-amber-600 dark:text-amber-400">
                        master
                      </span>{" "}
                      ={" "}
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        async
                      </span>{" "}
                      () {"=>"} {"{"}
                    </p>
                    <p className="pl-4 sm:pl-6">
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        await
                      </span>{" "}
                      Focus.
                      <span className="text-blue-600 dark:text-blue-400">
                        enable
                      </span>
                      ({"{"} noise:{" "}
                      <span className="text-orange-600 dark:text-orange-400">
                        false
                      </span>{" "}
                      {"}"});
                    </p>
                    <p className="pl-4 sm:pl-6">
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        return
                      </span>{" "}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        "Success!"
                      </span>
                      ;
                    </p>
                    <p>{"};"}</p>

                    <div className="bg-theme-action/10 border-theme-action/20 text-theme-action mt-4 flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-transform hover:scale-[1.02] sm:mt-6 sm:p-4">
                      <Code size={18} className="shrink-0" />
                      <div>
                        <p className="text-foreground font-sans text-xs font-black sm:text-sm">
                          Clean, curated content.
                        </p>
                        <p className="text-foreground/60 hidden font-sans text-[10px] font-medium sm:block sm:text-xs">
                          Optimized for reading.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE (BENTO BOX LAYOUT) ─────────────────────────────── */}
      <section className="bg-theme-element-sec border-theme-accent/10 relative w-full overflow-hidden border-t px-4 py-8 transition-colors duration-500 sm:px-6 lg:px-8">
        {/* Decorative Grid Lines in Background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-theme-accent)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-theme-accent)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_10%,transparent_100%)] bg-[size:6rem_6rem] opacity-5"></div>

        <div className="relative z-10 mx-auto max-w-7xl">
          {/* Section header */}
          <Reveal dir="up">
            <div className="mb-16 text-center sm:mb-20">
              <div className="from-theme-action/50 mb-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r to-purple-500/50 p-px">
                <div className="bg-theme-element-sec flex items-center gap-2 rounded-full px-4 py-1.5">
                  <Sparkles size={14} className="text-theme-action" />
                  <span className="text-foreground/80 text-xs font-black tracking-widest uppercase">
                    {heroContent?.advantageBadge || "The Advantage"}
                  </span>
                </div>
              </div>

              <h2 className="text-foreground text-4xl leading-[1.05] font-black tracking-tighter sm:text-5xl lg:text-[4rem]">
                {heroContent?.advantageTitle1 || "Why choose"}{" "}
                <br className="sm:hidden" />
                <span className="text-theme-action">
                  {heroContent?.advantageTitle2 || "Minimalistic?"}
                </span>
              </h2>
            </div>
          </Reveal>

          {/* ── PREMIUM HORIZONTAL GRID ── */}
          <div className="grid auto-rows-[minmax(0,_1fr)] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {/* CARD 1 - Focus */}
            <div className="h-full">
              <Reveal delay={0} dir="up">
                <Tilt className="h-full">
                  <div className="group bg-background border-theme-accent/15 hover:border-theme-action/30 relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border p-8 shadow-sm transition-all duration-500 hover:shadow-2xl sm:p-10">
                    <div className="bg-theme-action/10 group-hover:bg-theme-action/20 absolute -top-20 -right-20 h-64 w-64 rounded-full blur-[80px] transition-all duration-700"></div>

                    <div>
                      <div className="relative z-10 mb-8 flex items-start justify-between">
                        <div className="bg-theme-action/10 border-theme-action/20 text-theme-action group- flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] border shadow-inner transition-all duration-500 group-hover:rotate-6">
                          <Shield size={28} />
                        </div>
                        <div className="text-right">
                          <h3 className="text-foreground mb-1 text-3xl font-black tracking-tighter sm:text-4xl">
                            {heroContent?.c1Stat || "100%"}
                          </h3>
                          <p className="text-theme-action text-[10px] leading-tight font-bold tracking-widest uppercase">
                            {heroContent?.c1StatLabel || "Ad & Noise Free"}
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-foreground mb-3 text-2xl font-black">
                          {heroContent?.c1Title || "Focus on Core"}
                        </h3>
                        <p className="text-foreground/70 text-base leading-relaxed font-medium">
                          {heroContent?.c1Desc ||
                            "We radically strip away the noise. Every piece of content is engineered for maximum clarity and depth."}
                        </p>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </Reveal>
            </div>

            {/* CARD 2 - Quality */}
            <div className="h-full">
              <Reveal delay={100} dir="up">
                <Tilt className="h-full">
                  <div className="group bg-background border-theme-accent/15 relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border p-8 shadow-sm transition-all duration-500 hover:border-amber-500/30 hover:shadow-2xl sm:p-10">
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-500/10 blur-[80px] transition-all duration-700 group-hover:bg-amber-500/20"></div>

                    <div>
                      <div className="relative z-10 mb-8 flex items-start justify-between">
                        <div className="group- flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-inner transition-all duration-500 group-hover:-rotate-6">
                          <Zap size={28} />
                        </div>
                        <div className="text-right">
                          <h3 className="text-foreground mb-1 text-3xl font-black tracking-tighter sm:text-4xl">
                            {heroContent?.c2Stat || "4.9★"}
                          </h3>
                          <p className="text-[10px] leading-tight font-bold tracking-widest text-amber-500 uppercase">
                            {heroContent?.c2StatLabel || "Average Rating"}
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-foreground mb-3 text-2xl font-black">
                          {heroContent?.c2Title || "Uncompromising Quality"}
                        </h3>
                        <p className="text-foreground/70 text-base leading-relaxed font-medium">
                          {heroContent?.c2Desc ||
                            "Our editorial standards are absolute. Content only makes it through if it genuinely provides actionable value."}
                        </p>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </Reveal>
            </div>

            {/* CARD 3 - Community */}
            <div className="h-full">
              <Reveal delay={200} dir="up">
                <Tilt className="h-full">
                  <div className="group bg-background border-theme-accent/15 relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border p-8 shadow-sm transition-all duration-500 hover:border-emerald-500/30 hover:shadow-2xl sm:p-10">
                    <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px] transition-all duration-700 group-hover:bg-emerald-500/20"></div>

                    <div>
                      <div className="relative z-10 mb-8 flex items-start justify-between">
                        <div className="group- group- flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 shadow-inner transition-transform duration-500">
                          <Users size={28} />
                        </div>
                        <div className="text-right">
                          <h3 className="text-foreground mb-1 text-3xl font-black tracking-tighter sm:text-4xl">
                            {heroContent?.c3Stat || "12k+"}
                          </h3>
                          <p className="text-[10px] leading-tight font-bold tracking-widest text-emerald-500 uppercase">
                            {heroContent?.c3StatLabel || "Active Members"}
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-foreground mb-3 text-2xl font-black">
                          {heroContent?.c3Title || "Elite Peer Community"}
                        </h3>
                        <p className="text-foreground/70 text-base leading-relaxed font-medium">
                          {heroContent?.c3Desc ||
                            "Growth accelerates around the right people. Connect with ambitious developers dedicated to deep mastery."}
                        </p>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </Reveal>
            </div>
          </div>

          {/* Bottom CTA strip */}
          <Reveal dir="up" delay={300}>
            <div className="bg-foreground text-background group relative mt-16 flex flex-col items-center justify-between gap-10 overflow-hidden rounded-[2.5rem] px-8 py-12 shadow-2xl sm:mt-24 md:flex-row lg:p-16">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay dark:opacity-10"></div>
              <div className="bg-theme-action/30 absolute top-[-50%] right-[-10%] h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-1000 group-hover:bg-purple-500/40"></div>

              <div className="relative z-10 text-center md:text-left">
                <h3 className="mb-4 text-3xl font-black tracking-tight drop-shadow-sm sm:text-4xl lg:text-5xl">
                  {heroContent?.ctaTitle || "Commit to Mastery"}
                </h3>
                <p className="text-background/80 max-w-xl text-lg font-medium">
                  {heroContent?.ctaSubtitle ||
                    "Join the definitive platform built strictly for focused developers avoiding the modern noise."}
                </p>
              </div>
              <Link
                href="/register"
                className="group/btn bg-theme-action shadow-theme-action/20 relative z-10 flex w-full shrink-0 items-center justify-center gap-3 rounded-2xl px-10 py-5 text-sm font-black text-white shadow-xl transition-all hover:opacity-90 md:w-auto lg:text-base"
              >
                Join the Platform
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover/btn:translate-x-1"
                />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};
