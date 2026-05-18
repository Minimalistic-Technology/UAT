"use client";

import { useEffect, useRef, useState } from "react";
import {
  Shield, Zap, Globe, BookOpen, Target, Users, Star, ArrowRight, CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ─── Global keyframes injected once on client ──────────────────────────── */
const KEYFRAMES = `
  @keyframes floatBob {
    from { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
    to   { transform: translateY(-20px) rotate(8deg); opacity: 0.8; }
  }
  @keyframes heroSlideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes heroPulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.04); }
  }
`;

/* ─── Scroll-reveal hook ────────────────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

/* ─── Reveal wrapper ────────────────────────────────────────────────────── */
function Reveal({
  children, delay = 0, direction = "up",
}: {
  children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right" | "fade";
}) {
  const { ref, visible } = useScrollReveal();
  const transforms: Record<string, string> = {
    up: "translateY(36px)",
    left: "translateX(-36px)",
    right: "translateX(36px)",
    fade: "scale(0.96)",
  };
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[direction],
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── 3D Tilt Card ──────────────────────────────────────────────────────── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const card = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = card.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale3d(1.03,1.03,1.03)`;
  };
  const handleLeave = () => {
    if (card.current)
      card.current.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
  };
  return (
    <div
      ref={card}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Animated Counter ──────────────────────────────────────────────────── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useScrollReveal();
  useEffect(() => {
    if (!visible) return;
    let cur = 0;
    const step = Math.ceil(target / 55);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(cur);
    }, 20);
    return () => clearInterval(t);
  }, [visible, target]);
  return <span ref={ref} className="tabular-nums">{count.toLocaleString()}{suffix}</span>;
}

/* ─── Fixed particle config — generated once, never random ─────────────── */
// Deterministic values avoid any SSR/client mismatch.
const PARTICLES = [
  { id: 0,  size: 8,  left: 10,  top: 15,  delay: 0,   dur: 7  },
  { id: 1,  size: 5,  left: 25,  top: 70,  delay: 1,   dur: 9  },
  { id: 2,  size: 10, left: 40,  top: 30,  delay: 2,   dur: 8  },
  { id: 3,  size: 6,  left: 55,  top: 85,  delay: 0.5, dur: 11 },
  { id: 4,  size: 9,  left: 70,  top: 20,  delay: 3,   dur: 7  },
  { id: 5,  size: 4,  left: 82,  top: 60,  delay: 1.5, dur: 10 },
  { id: 6,  size: 7,  left: 90,  top: 40,  delay: 2.5, dur: 6  },
  { id: 7,  size: 5,  left: 15,  top: 90,  delay: 4,   dur: 9  },
  { id: 8,  size: 8,  left: 60,  top: 10,  delay: 0.8, dur: 12 },
  { id: 9,  size: 6,  left: 35,  top: 55,  delay: 3.5, dur: 8  },
  { id: 10, size: 9,  left: 75,  top: 78,  delay: 1.2, dur: 7  },
  { id: 11, size: 5,  left: 5,   top: 45,  delay: 2,   dur: 11 },
  { id: 12, size: 7,  left: 48,  top: 65,  delay: 0.3, dur: 9  },
  { id: 13, size: 10, left: 92,  top: 88,  delay: 4.5, dur: 6  },
  { id: 14, size: 4,  left: 20,  top: 35,  delay: 1.8, dur: 10 },
  { id: 15, size: 8,  left: 65,  top: 50,  delay: 2.7, dur: 8  },
  { id: 16, size: 6,  left: 30,  top: 20,  delay: 0.6, dur: 12 },
  { id: 17, size: 9,  left: 80,  top: 95,  delay: 3.2, dur: 7  },
];

/* ─── Page data ─────────────────────────────────────────────────────────── */
const STATS = [
  { value: 12000, suffix: "+", label: "Active Learners" },
  { value: 350,   suffix: "+", label: "Published Articles" },
  { value: 98,    suffix: "%", label: "Satisfaction Rate" },
  { value: 40,    suffix: "+", label: "Expert Authors" },
];

const VALUES = [
  { icon: Shield, title: "Distraction-Free", bg: "bg-blue-50",    text: "text-blue-600",    desc: "Curated content with zero ads, pop-ups, or irrelevant noise. Just pure knowledge." },
  { icon: Zap,    title: "Lightning Fast",   bg: "bg-amber-50",   text: "text-amber-600",   desc: "Optimized for speed so you spend time learning, not waiting." },
  { icon: Globe,  title: "Global Community", bg: "bg-emerald-50", text: "text-emerald-600", desc: "Connect with focused learners and expert educators from across the world." },
  { icon: Target, title: "Goal Oriented",    bg: "bg-purple-50",  text: "text-purple-600",  desc: "Every piece of content is structured to help you achieve measurable results." },
  { icon: Users,  title: "Expert-Led",       bg: "bg-pink-50",    text: "text-pink-600",    desc: "Content authored by practitioners who have mastered their domains." },
  { icon: Star,   title: "Quality First",    bg: "bg-indigo-50",  text: "text-indigo-600",  desc: "Every article is reviewed and curated for accuracy, depth, and clarity." },
];

const PRINCIPLES = [
  "Less content, more impact",
  "Clarity over complexity",
  "Depth over breadth",
  "Community-driven growth",
];

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function AboutPage() {
  /* Inject keyframes once on client */
  useEffect(() => {
    const id = "about-keyframes";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  return (
    <main className="flex-1 overflow-hidden">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-[5%] overflow-hidden">
        {/* Radial bg */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(24,119,242,0.11) 0%, transparent 70%), #fff",
          }}
        />

        {/* Floating particles — deterministic, no Math.random() */}
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-[#1877F2]/10 pointer-events-none"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animation: `floatBob ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
            }}
          />
        ))}

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 border border-blue-100 text-[#1877F2] text-xs font-bold uppercase tracking-widest mb-8"
          style={{ animation: "heroSlideUp 0.6s ease both" }}
        >
          <BookOpen size={13} />
          About Minimalistic Learning
        </div>

        <h1
          className="text-5xl sm:text-7xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[1.05] mb-8 max-w-5xl"
          style={{ animation: "heroSlideUp 0.7s 0.1s ease both" }}
        >
          Pure Education.{" "}
          <span
            className="text-[#1877F2] inline-block"
            style={{ animation: "heroPulse 4s ease-in-out infinite" }}
          >
            Zero Noise.
          </span>
        </h1>

        <p
          className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-12"
          style={{ animation: "heroSlideUp 0.7s 0.2s ease both" }}
        >
          We believe the fastest path to mastery is radical simplicity —
          stripping away every distraction until only the knowledge remains.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center gap-4"
          style={{ animation: "heroSlideUp 0.7s 0.3s ease both" }}
        >
          <Link
            href="/blog"
            className="group flex items-center gap-2 px-8 py-4 bg-[#1877F2] text-white rounded-full font-bold text-sm hover:shadow-xl hover:shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
          >
            Start Learning
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/register"
            className="px-8 py-4 bg-white text-gray-800 border border-gray-200 rounded-full font-bold text-sm hover:border-blue-200 hover:shadow-md transition-all"
          >
            Join Free
          </Link>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────── */}
      <section className="px-[5%] py-24 bg-gray-950">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} direction="up">
              <div className="text-center">
                <p className="text-4xl sm:text-5xl font-black text-white mb-2">
                  <Counter target={s.value} suffix={s.suffix} />
                </p>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FOCUS ZONE — Clean Image ───────────────────────────────────── */}
      <section className="px-[5%] py-28 bg-white">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <Reveal direction="left">
              <p className="text-xs font-black text-[#1877F2] uppercase tracking-widest mb-4">
                The Philosophy
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tighter mb-6">
                The Minimalist<br />
                <span className="text-[#1877F2]">Learning Edge</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Modern platforms drown learners in noise. Notifications, ads, and
                irrelevant content create mental fatigue that kills deep understanding.
                We built the antidote — a space engineered for depth.
              </p>
            </Reveal>
            <div className="space-y-3">
              {PRINCIPLES.map((p, i) => (
                <Reveal key={p} delay={i * 80} direction="left">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-[#1877F2] shrink-0" />
                    <span className="text-gray-700 font-semibold">{p}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Clean image — no overlay, no blur, no text */}
          <Reveal direction="right">
            <TiltCard>
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-blue-100 border border-gray-100">
                <Image
                  src="/focus_zone_about.png"
                  alt="Minimalistic Learning — Focus Zone workspace"
                  fill
                  sizes="(max-width: 1024px) 100vw, 580px"
                  priority
                  className="object-cover"
                />
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* ── VALUES GRID ───────────────────────────────────────────────── */}
      <section className="px-[5%] py-28 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <Reveal direction="up">
            <div className="text-center mb-16">
              <p className="text-xs font-black text-[#1877F2] uppercase tracking-widest mb-3">
                What We Stand For
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                Our Core Values
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 70} direction="up">
                <TiltCard>
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all h-full cursor-default">
                    <div className={`w-12 h-12 rounded-2xl ${v.bg} flex items-center justify-center ${v.text} mb-5`}>
                      <v.icon size={22} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">{v.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="relative px-[5%] py-36 overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(24,119,242,0.06) 0%, transparent 70%), #fff",
          }}
        />
        <Reveal direction="fade">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tighter mb-6">
              Ready to learn<br />
              <span className="text-[#1877F2]">the smarter way?</span>
            </h2>
            <p className="text-gray-500 text-lg mb-12 leading-relaxed">
              Join thousands of learners who chose clarity over clutter
              and depth over distraction.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group flex items-center gap-2 px-10 py-4 bg-[#1877F2] text-white rounded-full font-bold text-base hover:shadow-2xl hover:shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
              >
                Get Started Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/blog"
                className="px-10 py-4 bg-white text-gray-800 border border-gray-200 rounded-full font-bold text-base hover:border-blue-200 hover:shadow-md transition-all"
              >
                Explore Articles
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

    </main>
  );
}
