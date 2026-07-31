"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Terminal, Code, Sparkles } from "lucide-react";
import { HeroParticles } from "./HeroParticles";

export const HeroHeader = ({ heroContent }: { heroContent?: any }) => {
  return (
    <section
      className={`bg-background relative w-full overflow-hidden pt-8 pb-12 transition-colors duration-500 lg:pt-12 lg:pb-16`}
    >
      {/* Soft elegant gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,var(--color-element)_80%)] opacity-80 mix-blend-normal" />

      <AmbientHighlights />

      {/* Floating particles */}
      <HeroParticles />

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
                className="from-theme-action bg-linear-to-r to-purple-500 bg-clip-text text-transparent"
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
              <Link
                href="/login"
                className="group flex items-center justify-center gap-2.5 rounded-full bg-linear-to-r from-[#94b3f9] to-[#1877F2] px-8 pt-3 pb-3.5 text-base font-bold text-white shadow-[0_8px_20px_rgba(24,119,242,0.3)] shadow-[#1877F2]/30 transition-all hover:scale-[1.03]"
              >
                Get Started
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
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
              className="xs:max-w-[400px] relative z-10 mx-auto aspect-4/3 w-full max-w-[95vw] sm:max-w-[500px] lg:mx-0 lg:max-w-[600px] xl:max-w-[650px]"
              style={{ animation: "floatUI 8s ease-in-out infinite" }}
            >
              <div className="from-theme-action/20 absolute inset-0 rounded-4xl bg-linear-to-tr to-purple-500/20 blur-2xl" />

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
  );
};

function AmbientHighlights() {
  return (
    <>
      {/* Ambient Highlight Background */}
      <div className="bg-theme-action/20 pointer-events-none absolute top-[-10%] right-[-10%] h-[60%] w-[50%] rounded-full mix-blend-screen blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[50%] w-[40%] rounded-full bg-purple-500/10 mix-blend-screen blur-[120px]" />
    </>
  );
}
