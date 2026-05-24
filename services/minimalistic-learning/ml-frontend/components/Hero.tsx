"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Zap, Shield, Users, Code, Terminal, Sparkles } from "lucide-react";
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
    from { transform: translateY(0) rotate(0deg);  opacity: 0.25; }
    to   { transform: translateY(-24px) rotate(6deg); opacity: 0.7; }
  }
  @keyframes floatUI {
    0%   { transform: translateY(0px) rotate(0deg); }
    50%  { transform: translateY(-15px) rotate(1deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
  @keyframes slideUp {
    from { opacity:0; transform: translateY(32px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes slideRight {
    from { opacity:0; transform: translateX(-32px); }
    to   { opacity:1; transform: translateX(0); }
  }
  @keyframes pulse3d {
    0%,100% { transform: perspective(400px) rotateY(0deg) scale(1); }
    50%      { transform: perspective(400px) rotateY(6deg) scale(1.03); }
  }
`;

/* ─── 3-D Tilt wrapper ───────────────────────────────────────────────── */
function Tilt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    if (!el.current) return;
    const { left, top, width, height } = el.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    el.current.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale3d(1.04,1.04,1.04)`;
  };
  const leave = () => { if (el.current) el.current.style.transform = "perspective(700px) rotateY(0) rotateX(0) scale3d(1,1,1)"; };
  return (
    <div ref={el} onMouseMove={move} onMouseLeave={leave}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}>
      {children}
    </div>
  );
}

/* ─── Scroll-reveal ──────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, dir = "up" }:
  { children: React.ReactNode; delay?: number; dir?: "up" | "left" | "right" | "fade" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const t: Record<string, string> = { up: "translateY(36px)", left: "translateX(-36px)", right: "translateX(36px)", fade: "scale(0.95)" };
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : t[dir],
      transition: `opacity .65s ease ${delay}ms, transform .65s ease ${delay}ms`,
    }}>{children}</div>
  );
}

/* ─── Main Hero ──────────────────────────────────────────────────────── */
export const Hero = ({ previewData }: { previewData?: any }) => {
  const [heroContent, setHeroContent] = useState<any>(null);

  useEffect(() => {
    if (previewData) {
      setHeroContent(previewData);
      return;
    }

    const fetchContent = async () => {
      try {
        const res = await api.get('/public/content/home');
        if (res.data?.data?.hero) {
          setHeroContent(res.data.data.hero);
        }
      } catch (e) {
        // fail silently, falls back to default layout
      }
    };
    fetchContent();
  }, [previewData]);

  useEffect(() => {
    const id = "hero-kf";
    if (document.getElementById(id)) return;
    const s = document.createElement("style"); s.id = id; s.textContent = KF;
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        className={`relative w-full pt-8 lg:pt-12 pb-12 lg:pb-16 overflow-hidden 
          bg-background transition-colors duration-500`}
      >
        {/* Soft elegant gradient overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,var(--color-element)_80%)] opacity-80 mix-blend-normal pointer-events-none" />

        {/* Ambient Highlight Background */}
        <div className="absolute right-[-10%] top-[-10%] w-[50%] h-[60%] bg-theme-action/20 blur-[130px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute left-[-10%] bottom-[-10%] w-[40%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

        {/* Floating particles */}
        {PARTICLES.map(p => (
          <span key={p.id}
            className="absolute rounded-full bg-theme-action/20 pointer-events-none"
            style={{
              width: `${p.size}px`, height: `${p.size}px`,
              left: `${p.left}%`, top: `${p.top}%`,
              animation: `floatUp ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
            }}
          />
        ))}

        {/* 2-COLUMN LAYOUT */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 items-center">

            {/* LEFT COLUMN: Content */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left w-full">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-theme-element-sec backdrop-blur-md border border-theme-accent/20 shadow-sm text-theme-action text-[11px] font-black uppercase tracking-widest mb-6 lg:mb-8"
                style={{ animation: "slideRight 0.6s ease both" }}>
                <Sparkles size={14} className="text-amber-500" /> {heroContent?.badgeText || "Premium Learning Experience"}
              </div>

              <h1
                className="text-4xl xs:text-5xl sm:text-6xl lg:text-[3.5rem] xl:text-[4.2rem] font-black text-foreground tracking-tighter leading-[1.1] mb-6 drop-shadow-sm dark:drop-shadow-none"
                style={{ animation: "slideRight 0.7s 0.1s ease both" }}
              >
                {heroContent?.title || "Elevate your"} {' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-action to-purple-500" style={{ animation: "pulse3d 5s ease-in-out infinite" }}>
                  {heroContent?.highlight || "Knowledge"}
                </span>
                <br /> {heroContent?.bottomText || "Without Noise."}
              </h1>

              <p className="mx-auto lg:mx-0 text-foreground/70 font-medium text-base lg:text-lg max-w-xl mb-10 leading-relaxed"
                style={{ animation: "slideRight 0.7s 0.2s ease both" }}>
                {heroContent?.subtitle || "Welcome to Minimalistic Learning. A distraction-free platform where curious minds flourish. Master new tech skills with total clarity."}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 w-full"
                style={{ animation: "slideRight 0.7s 0.3s ease both" }}>
                <GetStartedBtn />
                <Link href="/resources"
                  className="group flex items-center gap-3 px-8 py-3.5 bg-theme-element-sec text-foreground border border-theme-accent/20 rounded-xl font-black text-sm hover:-translate-y-1 hover:shadow-lg transition-all shadow-sm">
                  <div className="w-7 h-7 rounded-lg bg-background text-foreground flex items-center justify-center border border-theme-accent/10">
                    <BookOpen size={13} fill="currentColor" />
                  </div>
                  Browse Hub
                  <ArrowRight size={16} className="text-foreground/50 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </Link>
              </div>

              {/* User Trust small widget */}
              <div className="mt-12 flex items-center justify-center lg:justify-start gap-4 border-t border-theme-accent/10 pt-6 w-full" style={{ animation: "slideRight 0.7s 0.4s ease both" }}>
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">JD</div>
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">AS</div>
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">MK</div>
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-theme-element-sec flex items-center justify-center text-foreground/70 font-black text-xs">+12k</div>
                </div>
                <p className="text-sm font-semibold text-foreground/60"><span className="text-foreground font-black">12,000+</span> Developers joined</p>
              </div>
            </div>

            {/* RIGHT COLUMN: Visual Glass Card */}
            <div className="flex w-full justify-center lg:justify-end mt-4 sm:mt-8 lg:mt-0 relative" style={{ animation: "slideUp 0.8s 0.2s ease both" }}>
              {/* Decorative Ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[450px] sm:h-[450px] lg:w-[550px] lg:h-[550px] rounded-full border border-theme-accent/20 border-dashed animate-spin-slow pointer-events-none" style={{ animationDuration: '30s' }}></div>

              {/* Main IDE Glass Card */}
              <div className="relative w-full max-w-[95vw] xs:max-w-[400px] sm:max-w-[500px] lg:max-w-[600px] xl:max-w-[650px] aspect-[4/3] z-10 mx-auto lg:mx-0" style={{ animation: "floatUI 8s ease-in-out infinite" }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-theme-action/20 to-purple-500/20 blur-2xl rounded-[2rem]" />

                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="h-10 sm:h-12 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex items-center px-4 justify-between">
                    <div className="flex gap-2">
                      <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-red-400" />
                      <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-amber-400" />
                      <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-mono text-foreground/40 font-bold uppercase tracking-widest bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                      <Terminal size={10} /> learn.ts
                    </div>
                  </div>
                  {/* Code Body */}
                  <div className="p-5 sm:p-6 text-[11px] sm:text-[13px] md:text-sm font-mono text-foreground/80 space-y-3 sm:space-y-4 flex-1">
                    <p><span className="text-purple-600 dark:text-purple-400 font-bold">import</span> {'{'} <span className="text-blue-600 dark:text-blue-400">Focus</span> {'}'} <span className="text-purple-600 dark:text-purple-400 font-bold">from</span> <span className="text-emerald-600 dark:text-emerald-400">'minimal'</span>;</p>
                    <br className="hidden sm:block" />
                    <p><span className="text-purple-600 dark:text-purple-400 font-bold">const</span> <span className="text-amber-600 dark:text-amber-400">master</span> = <span className="text-purple-600 dark:text-purple-400 font-bold">async</span> () {'=>'} {'{'}</p>
                    <p className="pl-4 sm:pl-6"><span className="text-purple-600 dark:text-purple-400 font-bold">await</span> Focus.<span className="text-blue-600 dark:text-blue-400">enable</span>({'{'} noise: <span className="text-orange-600 dark:text-orange-400">false</span> {'}'});</p>
                    <p className="pl-4 sm:pl-6"><span className="text-purple-600 dark:text-purple-400 font-bold">return</span> <span className="text-emerald-600 dark:text-emerald-400">"Success!"</span>;</p>
                    <p>{'};'}</p>

                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-theme-action/10 border border-theme-action/20 text-theme-action flex items-center gap-3 transition-transform hover:scale-[1.02] cursor-pointer">
                      <Code size={18} className="shrink-0" />
                      <div>
                        <p className="font-sans font-black text-xs sm:text-sm text-foreground">Clean, curated content.</p>
                        <p className="font-sans font-medium text-[10px] sm:text-xs text-foreground/60 hidden sm:block">Optimized for reading.</p>
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
      <section className="relative w-full px-4 sm:px-6 lg:px-8 py-24 sm:py-32 bg-theme-element-sec border-t border-theme-accent/10 transition-colors duration-500 overflow-hidden">

        {/* Decorative Grid Lines in Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-theme-accent)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-theme-accent)_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_10%,transparent_100%)] opacity-5 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section header */}
          <Reveal dir="up">
            <div className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center justify-center p-px rounded-full bg-gradient-to-r from-theme-action/50 to-purple-500/50 mb-6">
                <div className="bg-theme-element-sec rounded-full px-4 py-1.5 flex items-center gap-2">
                  <Sparkles size={14} className="text-theme-action" />
                  <span className="text-xs font-black text-foreground/80 uppercase tracking-widest">
                    {heroContent?.advantageBadge || "The Advantage"}
                  </span>
                </div>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-[4rem] font-black text-foreground tracking-tighter leading-[1.05]">
                {heroContent?.advantageTitle1 || "Why choose"} <br className="sm:hidden" />
                <span className="text-theme-action">
                  {heroContent?.advantageTitle2 || "Minimalistic?"}
                </span>
              </h2>
            </div>
          </Reveal>

          {/* ── PREMIUM HORIZONTAL GRID ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-[minmax(0,_1fr)]">

            {/* CARD 1 - Focus */}
            <div className="h-full">
              <Reveal delay={0} dir="up">
                <Tilt className="h-full">
                  <div className="group relative h-full bg-background rounded-[2rem] border border-theme-accent/15 overflow-hidden shadow-sm hover:shadow-2xl hover:border-theme-action/30 transition-all duration-500 p-8 sm:p-10 flex flex-col justify-between">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-theme-action/10 blur-[80px] rounded-full group-hover:bg-theme-action/20 transition-all duration-700"></div>

                    <div>
                      <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-theme-action/10 border border-theme-action/20 flex items-center justify-center text-theme-action shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shrink-0">
                          <Shield size={28} />
                        </div>
                        <div className="text-right">
                          <h3 className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter mb-1">{heroContent?.c1Stat || "100%"}</h3>
                          <p className="text-[10px] font-bold text-theme-action uppercase tracking-widest leading-tight">{heroContent?.c1StatLabel || "Ad & Noise Free"}</p>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-2xl font-black text-foreground mb-3">{heroContent?.c1Title || "Focus on Core"}</h3>
                        <p className="text-foreground/70 font-medium text-base leading-relaxed">{heroContent?.c1Desc || "We radically strip away the noise. Every piece of content is engineered for maximum clarity and depth."}</p>
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
                  <div className="group relative h-full bg-background rounded-[2rem] border border-theme-accent/15 overflow-hidden shadow-sm hover:shadow-2xl hover:border-amber-500/30 transition-all duration-500 p-8 sm:p-10 flex flex-col justify-between">
                    <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full group-hover:bg-amber-500/20 transition-all duration-700"></div>

                    <div>
                      <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shrink-0">
                          <Zap size={28} />
                        </div>
                        <div className="text-right">
                          <h3 className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter mb-1">{heroContent?.c2Stat || "4.9★"}</h3>
                          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-tight">{heroContent?.c2StatLabel || "Average Rating"}</p>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-2xl font-black text-foreground mb-3">{heroContent?.c2Title || "Uncompromising Quality"}</h3>
                        <p className="text-foreground/70 font-medium text-base leading-relaxed">{heroContent?.c2Desc || "Our editorial standards are absolute. Content only makes it through if it genuinely provides actionable value."}</p>
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
                  <div className="group relative h-full bg-background rounded-[2rem] border border-theme-accent/15 overflow-hidden shadow-sm hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-500 p-8 sm:p-10 flex flex-col justify-between">
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700"></div>

                    <div>
                      <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 group-hover:scale-110 transition-transform duration-500 shrink-0">
                          <Users size={28} />
                        </div>
                        <div className="text-right">
                          <h3 className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter mb-1">{heroContent?.c3Stat || "12k+"}</h3>
                          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-tight">{heroContent?.c3StatLabel || "Active Members"}</p>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-2xl font-black text-foreground mb-3">{heroContent?.c3Title || "Elite Peer Community"}</h3>
                        <p className="text-foreground/70 font-medium text-base leading-relaxed">{heroContent?.c3Desc || "Growth accelerates around the right people. Connect with ambitious developers dedicated to deep mastery."}</p>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </Reveal>
            </div>

          </div>

          {/* Bottom CTA strip */}
          <Reveal dir="up" delay={300}>
            <div className="mt-16 sm:mt-24 rounded-[2.5rem] bg-foreground text-background px-8 py-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
              <div className="absolute right-[-10%] top-[-50%] w-[500px] h-[500px] bg-theme-action/30 blur-[120px] rounded-full group-hover:bg-purple-500/40 transition-colors duration-1000"></div>

              <div className="relative z-10 text-center md:text-left">
                <h3 className="font-black text-3xl sm:text-4xl lg:text-5xl mb-4 tracking-tight drop-shadow-sm">{heroContent?.ctaTitle || "Commit to Mastery"}</h3>
                <p className="text-background/80 text-lg font-medium max-w-xl">{heroContent?.ctaSubtitle || "Join the definitive platform built strictly for focused developers avoiding the modern noise."}</p>
              </div>
              <Link href="/register"
                className="relative z-10 group/btn flex items-center justify-center gap-3 px-10 py-5 bg-theme-action text-white rounded-2xl font-black text-sm lg:text-base hover:opacity-90 hover:-translate-y-1 transition-all shadow-xl shadow-theme-action/20 shrink-0 w-full md:w-auto">
                Join the Platform
                <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};
