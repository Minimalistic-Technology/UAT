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
 <div className="relative flex flex-col items-center justify-center min-h-[100dvh] bg-background text-foreground px-4 text-center overflow-hidden">

 {/* Premium Background Elements */}
 <div className="absolute inset-0 bg-grid-theme-accent/[0.02] bg-[size:50px_50px]" />
 <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />

 {/* Glowing Orbs */}
 <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-theme-action/20 blur-[120px] rounded-full animate-pulse pointer-events-none" />
 <div className="absolute bottom-1/4 right-1/4 w-[25vw] h-[25vw] bg-purple-500/10 blur-[100px] rounded-full animate-pulse delay-1000 pointer-events-none" />

 <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
 <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground to-foreground/20 uppercase drop-shadow-sm">
 Coming<br />Soon
 </h1>

 <p className="text-lg sm:text-xl md:text-2xl text-foreground/50 font-bold max-w-2xl mx-auto leading-relaxed">
 We are currently crafting a more <span className="text-foreground">premium experience</span>. The minimal framework is being upgraded in the background. We'll be right back!
 </p>
 </div>

 {/* Minimal Watermark */}
 <div className="absolute bottom-10 left-0 right-0 text-center opacity-30 pointer-events-none select-none">
 <p className="text-[100px] md:text-[200px] font-black tracking-tighter text-theme-accent/5 leading-none">
 ML
 </p>
 </div>
 </div>
 );
}
