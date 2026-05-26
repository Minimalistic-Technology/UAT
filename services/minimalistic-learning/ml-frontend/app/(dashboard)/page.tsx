"use client";

import React from "react";
// import { BlogList } from "@/features/blog/components/blog-list"; // Commented out with Blog Section
import TrendingSection from "@/features/blog/components/TrendingSection";
// import { ArrowRight, BookOpen, TrendingUp } from "lucide-react"; // Commented out with Blog Section
// import Link from "next/link"; // Commented out with Blog Section
import { Hero } from "@/components/Hero";
import { useEffect, useRef, useState } from "react";
// import "./globals.css";

/* ─── Scroll reveal ─────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, dir = "up" }:
  { children: React.ReactNode; delay?: number; dir?: "up" | "left" | "right" | "fade" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const t: Record<string, string> = {
    up: "translateY(32px)", left: "translateX(-32px)",
    right: "translateX(32px)", fade: "scale(0.96)",
  };
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : t[dir],
      transition: `opacity .65s ease ${delay}ms, transform .65s ease ${delay}ms`,
    }}>{children}</div>
  );
}

const Home: React.FC = () => {
  return (
    <main className="flex-1 w-full relative">
      {/* Hero + Why Choose (inside Hero.tsx) */}
      <Hero />

      {/* ── Trending / Most Viewed Section ────────────────────────────── */}
      <TrendingSection />

      {/* ── Blogs & Articles Section ── COMMENTED OUT (TrendingSection yeh kaam kar raha hai)
      <section id="blog-list" className="w-full px-[5%] py-20 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <Reveal dir="up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-14">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-[#1877F2]/10 flex items-center justify-center">
                    <TrendingUp size={14} className="text-[#1877F2]" />
                  </div>
                  <p className="text-xs font-black text-[#1877F2] uppercase tracking-widest">
                    Latest Stories
                  </p>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                  <span className="text-[#1877F2]">Blogs</span> & Articles
                </h2>
              </div>
              <Link
                href="/blog"
                className="group flex items-center gap-2.5 px-7 py-3.5 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gray-200 shrink-0"
              >
                View All Stories
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>

          <Reveal dir="up" delay={100}>
            <BlogList limit={4} hideControls={true} />
          </Reveal>

          <Reveal dir="up" delay={200}>
            <div className="text-center mt-14">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 text-sm font-bold text-[#1877F2] hover:text-blue-700 transition-colors"
              >
                <BookOpen size={16} />
                Explore all articles on the platform
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
      ── Blogs & Articles Section END ── */}
    </main>
  );
};

export default Home;