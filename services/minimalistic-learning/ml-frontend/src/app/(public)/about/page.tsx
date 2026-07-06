"use client";

import { useEffect } from "react";
import {
  Shield,
  Zap,
  Globe,
  Target,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePublicGlobalStore } from "@/store/publicGlobalStore";
import { Reveal } from "@/components/ui/reveal";
import { Counter } from "@/components/ui/counter";

/* ─── Page data ──────────────────────────────────────────────────────── */
const STATS = [
  { value: 12000, suffix: "+", label: "Active Learners" },
  { value: 98, suffix: "%", label: "Completion Rate" },
  { value: 350, suffix: "+", label: "Curated Guides" },
  { value: 40, suffix: "+", label: "Expert Authors" },
];

const VALUES = [
  {
    icon: Shield,
    title: "Uncompromising Quality",
    desc: "Every article is rigorously reviewed. We prioritize depth, accuracy, and absolute clarity over sheer volume.",
  },
  {
    icon: Zap,
    title: "Zero Friction",
    desc: "No ads, no popups, no dark patterns. We designed a platform that respects your time and your attention.",
  },
  {
    icon: Users,
    title: "Elite Community",
    desc: "Surround yourself with driven peers. Growth accelerates when you immerse in a network of dedicated builders.",
  },
  {
    icon: Target,
    title: "Goal-Oriented",
    desc: "Reading should yield results. Our resources are deeply actionable and meant to be applied in the real world.",
  },
  {
    icon: Globe,
    title: "Global Perspective",
    desc: "Diverse authors cross-pollinate ideas from different regions, creating a truly global learning standard.",
  },
  {
    icon: Lightbulb,
    title: "Continuous Evolution",
    desc: "Our curriculum adapts to modern tech. We constantly refine our resources to keep you at the sharpest edge.",
  },
];

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function AboutPage() {
  const { aboutContent, fetchAboutContent } = usePublicGlobalStore();

  useEffect(() => {
    fetchAboutContent();
  }, [fetchAboutContent]);

  const displayStats = aboutContent?.dynamicStats || STATS;

  return (
    <main className="bg-background flex-1 overflow-hidden">
      {/* ── CLEAN HERO ───────────────────────────────────────────────── */}
      <section className="relative flex w-full flex-col items-center px-4 pt-6 pb-24 text-center sm:px-6 md:pt-10 md:pb-32 lg:px-8 lg:pt-12 lg:pb-40">
        {/* Soft Ambient Glow */}
        <div className="bg-theme-action/10 pointer-events-none absolute top-0 left-1/2 -z-10 h-[400px] w-full max-w-[800px] -translate-x-1/2 rounded-full blur-[100px]"></div>
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-theme-accent)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-theme-accent)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_10%,transparent_100%)] bg-[size:4rem_4rem] opacity-5"></div>

        <div className="mx-auto flex max-w-4xl flex-col items-center">
          <Reveal delay={0} dir="up">
            <div className="bg-theme-element-sec border-theme-accent/20 mb-8 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm">
              <div className="bg-theme-action h-2 w-2 rounded-full"></div>
              <span className="text-foreground/80 mt-0.5 text-[11px] leading-none font-bold tracking-widest uppercase">
                Who We Are
              </span>
            </div>
          </Reveal>

          <Reveal delay={100} dir="up">
            <h1 className="text-foreground mb-6 text-4xl leading-[1.05] font-black tracking-tighter drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl">
              The Platform Engineered <br className="hidden md:block" /> for
              Absolute <span className="text-theme-action">Focus.</span>
            </h1>
          </Reveal>

          <Reveal delay={200} dir="up">
            <p className="text-foreground/70 mb-10 max-w-2xl text-lg leading-relaxed font-medium text-balance md:text-xl">
              Modern the web is loud. We built Minimalistic Learning as the
              ultimate quiet place—stripping away every distraction until only
              pure, actionable knowledge remains.
            </p>
          </Reveal>

          <Reveal delay={300} dir="up">
            <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
              <Link
                href="/blog"
                className="bg-foreground text-background group flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-black transition-all hover:shadow-lg sm:w-auto"
              >
                Explore Content
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/register"
                className="bg-theme-element-sec border-theme-accent/20 text-foreground hover:border-theme-action/40 w-full rounded-xl border px-8 py-3.5 text-center text-sm font-bold transition-all sm:w-auto"
              >
                Join Community
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SLEEK STATS STRIP ────────────────────────────────────────── */}
      <section className="w-full px-4 pb-32 sm:px-6 lg:px-8">
        <Reveal delay={400} dir="up">
          <div className="bg-theme-element-sec border-theme-accent/15 divide-theme-accent/10 mx-auto flex max-w-6xl flex-col divide-y rounded-3xl border shadow-sm md:flex-row md:divide-x md:divide-y-0">
            {displayStats.map((s: any, i: number) => (
              <div
                key={i}
                className="group flex flex-1 flex-col items-center justify-center px-8 py-10 text-center"
              >
                <p className="text-foreground group- mb-2 text-4xl font-black tracking-tighter transition-transform duration-300 lg:text-5xl">
                  <Counter target={s.value} suffix={s.suffix} />
                </p>
                <p className="text-theme-action text-[11px] font-bold tracking-widest uppercase">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── PHILOSOPHY (Z-PATTERN) ───────────────────────────────────── */}
      <section className="bg-theme-element border-theme-accent/10 w-full border-y px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal dir="left" className="order-2 lg:order-1">
            <div className="border-theme-accent/20 bg-theme-element-sec group relative aspect-[4/3] overflow-hidden rounded-3xl border shadow-2xl">
              <div className="bg-theme-action/5 absolute inset-0 z-10 mix-blend-overlay transition-colors duration-500 group-hover:bg-transparent"></div>
              <Image
                src="/focus_zone_about.png"
                alt="Workspace engineered for focus"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="group- object-cover transition-transform duration-700"
              />
            </div>
          </Reveal>

          <Reveal dir="right" className="order-1 lg:order-2">
            <div>
              <h2 className="text-foreground mb-6 text-3xl leading-tight font-black tracking-tighter sm:text-4xl md:text-5xl">
                Redefining the <br />{" "}
                <span className="text-theme-action">Learning Edge.</span>
              </h2>
              <p className="text-foreground/70 mb-8 text-base leading-relaxed font-medium sm:text-lg">
                The prevailing model of online education is flawed.
                Subscriptions trap you, notifications distract you, and infinite
                scrolling feeds paralyze you. We built this platform as an
                antidote. A space strictly reserved for high-signal, zero-noise
                engineering and design education.
              </p>

              <ul className="space-y-4">
                {[
                  "No intrusive advertisements or paywalls.",
                  "Clean, readable typography on every device.",
                  "Community-vetted, expert-authored insights.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="bg-theme-action/10 text-theme-action mt-0.5 shrink-0 rounded-full p-1">
                      <CheckCircle size={16} />
                    </div>
                    <span className="text-foreground/80 text-sm leading-snug font-bold sm:text-base">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CORE VALUES GRID ─────────────────────────────────────────── */}
      <section className="bg-background w-full px-4 py-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal dir="up">
            <div className="mb-16 text-center md:mb-24">
              <h2 className="text-foreground mb-4 text-3xl font-black tracking-tighter sm:text-4xl md:text-5xl">
                Our Core Values
              </h2>
              <p className="text-foreground/70 mx-auto max-w-2xl text-lg font-medium">
                The unshakeable principles that guide everything we build,
                design, and write.
              </p>
            </div>
          </Reveal>

          <div className="grid auto-rows-[minmax(0,_1fr)] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {VALUES.map((val, i) => (
              <Reveal key={i} delay={i * 50} dir="up" className="h-full">
                <div className="bg-theme-element-sec border-theme-accent/20 hover:border-theme-action/30 group flex h-full flex-col rounded-3xl border p-8 transition-all duration-300 hover:shadow-lg">
                  <div className="bg-background border-theme-accent/15 text-foreground group-hover:bg-theme-action group-hover:border-theme-action mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-all duration-300 group-hover:-rotate-3 group-hover:text-white">
                    <val.icon size={24} />
                  </div>
                  <h3 className="text-foreground mb-3 text-xl font-black tracking-tight">
                    {val.title}
                  </h3>
                  <p className="text-foreground/70 text-sm leading-relaxed font-medium">
                    {val.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="w-full px-4 pb-32 sm:px-6 lg:px-8">
        <Reveal dir="up">
          <div className="bg-foreground text-background group relative mx-auto flex max-w-5xl flex-col items-center overflow-hidden rounded-[2.5rem] px-8 py-16 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay dark:opacity-10"></div>
            <div className="bg-theme-action/40 absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] transition-colors duration-1000 group-hover:bg-blue-400/50"></div>

            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-black tracking-tighter sm:text-4xl md:text-5xl">
                Ready to focus?
              </h2>
              <p className="text-background/80 mx-auto mb-10 max-w-md text-lg font-medium">
                Join thousands of developers learning without the noise.
              </p>
              <Link
                href="/register"
                className="bg-theme-action shadow-theme-action/20 inline-flex items-center justify-center gap-3 rounded-xl px-10 py-4 text-sm font-black text-white shadow-xl transition-all hover:opacity-90 lg:text-base"
              >
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
