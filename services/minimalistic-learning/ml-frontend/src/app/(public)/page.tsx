"use client";

import { useEffect } from "react";
import { Hero } from "@/components/Hero";
import TrendingSection from "@/components/TrendingSection";
import { usePublicGlobalStore } from "@/store/publicGlobalStore";

export default function Home() {
  const { homeContent, fetchHomeContent } = usePublicGlobalStore();

  useEffect(() => {
    fetchHomeContent();
  }, [fetchHomeContent]);

  return (
    <main className="bg-background min-h-screen">
      <Hero previewData={homeContent?.hero ?? null} />
      <TrendingSection
        trendingBadge={homeContent?.hero?.trendingBadge}
        trendingTitle={homeContent?.hero?.trendingTitle}
      />
    </main>
  );
}
