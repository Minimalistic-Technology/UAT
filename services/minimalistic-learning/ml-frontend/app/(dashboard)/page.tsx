"use client";

import React from "react";
import TrendingSection from "@/features/blog/components/TrendingSection";
import { Hero } from "@/components/Hero";

const Home: React.FC = () => {
  return (
    <main className="flex-1 w-full relative">
      {/* Hero + Why Choose (inside Hero.tsx) */}
      <Hero />

      {/* ── Trending / Most Viewed Section ────────────────────────────── */}
      <TrendingSection />
    </main>
  );
};

export default Home;