"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Zap, Shield, Users } from "lucide-react";
import GetStartedBtn from "./get-started";

/* ─── Deterministic particles (no Math.random — avoids SSR mismatch) ─── */
const PARTICLES = [
  { id: 0, size: 10, left: 8, top: 18, dur: 8, delay: 0 },
  { id: 1, size: 6, left: 18, top: 72, dur: 11, delay: 1.5 },
  { id: 2, size: 14, left: 30, top: 35, dur: 7, delay: 0.8 },
  { id: 3, size: 8, left: 48, top: 82, dur: 10, delay: 2 },
  { id: 4, size: 5, left: 62, top: 15, dur: 9, delay: 0.3 },
  { id: 5, size: 12, left: 75, top: 58, dur: 6, delay: 3 },
  { id: 6, size: 7, left: 88, top: 30, dur: 12, delay: 1 },
  { id: 7, size: 9, left: 92, top: 78, dur: 8, delay: 2.5 },
  { id: 8, size: 5, left: 55, top: 48, dur: 11, delay: 0.6 },
  { id: 9, size: 11, left: 22, top: 90, dur: 7, delay: 4 },
  { id: 10, size: 6, left: 70, top: 92, dur: 9, delay: 1.2 },
  { id: 11, size: 8, left: 40, top: 10, dur: 10, delay: 3.5 },
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
  @keyframes slideUp {
    from { opacity:0; transform: translateY(32px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes pulse3d {
    0%,100% { transform: perspective(400px) rotateY(0deg) scale(1); }
    50%      { transform: perspective(400px) rotateY(6deg) scale(1.03); }
  }
  @keyframes spinSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
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

/* ─── BackgroundCloud SVG (Light Mode) ─────────────────────────────── */
const Cloud = ({ className, opacity = 0.7 }: { className?: string; opacity?: number }) => (
  <svg viewBox="0 0 326 211" fill="none" xmlns="http://www.w3.org/2000/svg"
    className={`dark:hidden ${className}`} style={{ opacity }} aria-hidden>
    <path fillRule="evenodd" clipRule="evenodd"
      d="M124.629 0.4076C90.2868 -3.12596 58.1132 17.5192 45.4526 49.0305C19.0494 54.0628 0 77.0654 0 104.996C0 135.534 24.757 160.291 55.2954 160.291H284.187C307.29 160.291 326.018 141.564 326.018 118.461C326.018 97.433 310.493 80.0152 290.311 77.1062C281.821 34.6298 244.593 3.39867 200.75 3.39867C184.6 3.39867 169.524 8.01633 156.402 16.035C148.047 6.44297 137.054 1.68536 124.629 0.4076Z"
      fill="white" />
  </svg>
);

/* ─── Main Hero ──────────────────────────────────────────────────────── */
export const Hero = () => {
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
        className={`relative w-full pt-32 md:pt-48 pb-24 overflow-hidden 
          bg-background
          transition-colors duration-500 min-h-[90vh] flex flex-col justify-center`}
      >
        {/* Soft elegant gradient overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,var(--color-element)_80%)] opacity-80 mix-blend-normal pointer-events-none" />

        {/* Border line to cleanly separate from Navbar in dark mode */}
        <div className="absolute top-0 left-0 right-0 h-px bg-transparent dark:bg-white/[0.03]" />

        {/* Clouds (Light mode only) */}
        <Cloud className="absolute -top-10 -left-20 w-[400px] sm:w-[600px] pointer-events-none z-0" opacity={0.65} />
        <Cloud className="absolute top-10 -right-32 w-[500px] sm:w-[700px] pointer-events-none z-0" opacity={0.7} />

        {/* Ambient Highlight */}
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[50%] bg-theme-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

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

        {/* Floating topic pills */}
        {[
          { label: "#Technology", cls: "top-48 left-[5%] -rotate-[8deg]", delay: "0s" },
          { label: "#Software", cls: "top-[290px] left-[3%] rotate-[5deg]", delay: "0.4s" },
          { label: "#Productivity", cls: "top-44 right-[6%] rotate-[10deg]", delay: "0.2s" },
          { label: "#Design", cls: "top-[270px] right-[3%] -rotate-[5deg]", delay: "0.6s" },
        ].map(p => (
          <div key={p.label}
            className={`absolute hidden sm:flex bg-theme-element/80 backdrop-blur-md border border-theme-accent/20 shadow-sm px-4 py-2 rounded-full text-xs font-bold text-foreground ${p.cls}`}
            style={{ animation: `floatUp 7s ${p.delay} ease-in-out infinite alternate` }}>
            {p.label}
          </div>
        ))}

        {/* Center Content */}
        <div className="relative z-20 max-w-5xl mx-auto px-[5%] flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-theme-element/70 backdrop-blur-md border border-theme-accent/20 shadow-sm text-theme-action text-xs font-bold uppercase tracking-widest mb-8"
            style={{ animation: "slideUp 0.6s ease both" }}>
            <BookOpen size={13} /> Premium Distraction-Free Learning
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] font-black text-foreground tracking-tighter leading-[1.05] mb-6 drop-shadow-sm dark:drop-shadow-none"
            style={{ animation: "slideUp 0.7s 0.1s ease both" }}
          >
            Minimalistic<br />
            <span className="text-theme-action" style={{ animation: "pulse3d 5s ease-in-out infinite" }}>
              Learning
            </span>
          </h1>

          <p className="text-foreground/80 font-medium text-base sm:text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
            style={{ animation: "slideUp 0.7s 0.2s ease both" }}>
            A distraction-free platform where curious minds can flourish —
            master new skills with total clarity and zero noise.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
            style={{ animation: "slideUp 0.7s 0.3s ease both" }}>
            <GetStartedBtn />
            <Link href="/resources"
              className="group flex items-center gap-3 px-8 py-3.5 bg-theme-element text-foreground border border-theme-accent/20 rounded-full font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-sm">
              <div className="w-6 h-6 rounded-full bg-theme-element-sec text-foreground flex items-center justify-center">
                <BookOpen size={11} fill="currentColor" />
              </div>
              Resources
              <ArrowRight size={14} className="text-foreground/50 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE ────────────────────────────────────────────────── */}
      <section className="w-full px-[5%] py-28 bg-theme-element border-t border-theme-accent/10 transition-colors duration-500">
        <div className="max-w-[1200px] mx-auto">
          {/* Section header */}
          <Reveal dir="up">
            <div className="text-center mb-20">
              <p className="text-xs font-black text-theme-action uppercase tracking-widest mb-4">
                Why Us
              </p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tighter leading-tight">
                Why choose<br />
                <span className="text-theme-action">Minimalistic?</span>
              </h2>
              <p className="text-foreground/80 text-lg mt-6 max-w-xl mx-auto leading-relaxed">
                Our readers choose us for the highest-quality, distraction-free curation of education — nothing more, nothing less.
              </p>
            </div>
          </Reveal>

          {/* Feature Cards — 3D tilt */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 100} dir="up">
                <Tilt className="h-full">
                  <div className={`h-full bg-theme-element-sec rounded-3xl border border-theme-accent/20 p-8 shadow-sm hover:shadow-lg hover:border-theme-action/50 transition-all cursor-default`}>
                    {/* Icon + stat row */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-theme-element flex items-center justify-center ${f.color} shadow-sm border border-theme-accent/10`}>
                        <f.icon size={26} />
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${f.color}`}>{f.stat}</p>
                        <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">{f.statLabel}</p>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-foreground mb-3">{f.title}</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>

          {/* Bottom CTA strip */}
          <Reveal dir="up" delay={300}>
            <div className="mt-16 rounded-3xl bg-theme-element-sec border border-theme-accent/20 px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div>
                <p className="text-foreground font-black text-xl mb-1">Ready to dive deep?</p>
                <p className="text-foreground/80 text-sm font-medium">Join 12,000+ learners on the minimal path.</p>
              </div>
              <Link href="/register"
                className="group flex items-center gap-2 px-8 py-3.5 bg-theme-action text-white rounded-full font-bold text-sm hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-md shrink-0">
                Get Started Free
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};
