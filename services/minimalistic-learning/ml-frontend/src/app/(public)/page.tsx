"use client";

import { useEffect } from "react";
import TrendingSection from "@/components/TrendingSection";
import { usePublicGlobalStore } from "@/store/publicGlobalStore";
import { HeroFeatures, HeroHeader } from "@/features/landing/components";

export default function Home() {
  const { homeContent, fetchHomeContent } = usePublicGlobalStore();

  useEffect(() => {
    fetchHomeContent();
  }, [fetchHomeContent]);

  return (
    <main className="bg-background min-h-screen">
      <HeroHeader heroContent={homeContent?.hero ?? null} />
      <HeroFeatures heroContent={homeContent?.hero ?? null} />
      <TrendingSection
        trendingBadge={homeContent?.hero?.trendingBadge}
        trendingTitle={homeContent?.hero?.trendingTitle}
      />
    </main>
  );
}
