"use client";

import { Hammer, Wrench, Drill, Mail } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 px-4">
      {/* Background accents (matches site's radial gradient theme) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(at 15% 20%, rgba(13, 148, 136, 0.18) 0px, transparent 50%), radial-gradient(at 85% 80%, rgba(16, 185, 129, 0.18) 0px, transparent 50%)",
        }}
      />

      <div className="pointer-events-none absolute -top-16 -left-16 size-64 rounded-full bg-teal-500/10 blur-3xl animate-float" />
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 size-72 rounded-full bg-emerald-500/10 blur-3xl animate-float"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl animate-fadeUp">
        {/* Logo mark */}
        <div className="flex items-center gap-2 mb-8">
          <div className="size-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/30">
            D
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
            DDTEC
          </span>
        </div>

        <div className="flex items-center gap-3 mb-6 text-teal-600 dark:text-teal-400">
          <Wrench className="size-6 animate-float" style={{ animationDelay: "0.2s" }} />
          <Drill className="size-7 animate-float" style={{ animationDelay: "0.6s" }} />
          <Hammer className="size-6 animate-float" style={{ animationDelay: "1s" }} />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
          Something <span className="text-gradient">Big</span> Is Coming
        </h1>

        <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-md mb-10">
          We&apos;re building precision-crafted tools and a brand new experience.
          DDTEC will be back online shortly &mdash; stay tuned.
        </p>

        <div className="glass-card rounded-full px-6 py-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Mail className="size-4 text-teal-600 dark:text-teal-400" />
          <span>
            Questions? Reach us at{" "}
            <a
              href="mailto:support@ddtec.com"
              className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              support@ddtec.com
            </a>
          </span>
        </div>
      </div>

      <p className="relative z-10 mt-16 text-xs text-slate-400 dark:text-slate-600">
        &copy; {new Date().getFullYear()} DDTEC. All rights reserved.
      </p>
    </div>
  );
}
