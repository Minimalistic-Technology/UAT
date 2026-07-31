import React from "react";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming Soon | Minimalistic Learning",
  description: "We are currently under maintenance and upgrading our systems.",
  robots: "noindex, nofollow",
};

export default function ComingSoonPage() {
  return (
    <div className="bg-background text-foreground relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Premium Background Elements */}
      <div className="bg-grid-theme-accent/[0.02] absolute inset-0 bg-[size:50px_50px]" />
      <div className="bg-background/80 absolute inset-0 backdrop-blur-3xl" />

      {/* Glowing Orbs */}
      <div className="bg-theme-action/20 pointer-events-none absolute top-1/4 left-1/4 h-[30vw] w-[30vw] animate-pulse rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[25vw] w-[25vw] animate-pulse rounded-full bg-purple-500/10 blur-[100px] delay-1000" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <h1 className="from-foreground via-foreground to-foreground/20 mb-8 bg-gradient-to-br bg-clip-text text-7xl font-black tracking-tighter text-transparent uppercase drop-shadow-sm sm:text-8xl md:text-9xl">
          Coming
          <br />
          Soon
        </h1>

        <p className="text-foreground/50 mx-auto max-w-2xl text-lg leading-relaxed font-bold sm:text-xl md:text-2xl">
          We are currently crafting a more{" "}
          <span className="text-foreground">premium experience</span>. The
          minimal framework is being upgraded in the background. We'll be right
          back!
        </p>
      </div>

      {/* Minimal Watermark */}
      <div className="pointer-events-none absolute right-0 bottom-10 left-0 text-center opacity-30 select-none">
        <p className="text-theme-accent/5 text-[100px] leading-none font-black tracking-tighter md:text-[200px]">
          ML
        </p>
      </div>
    </div>
  );
}
