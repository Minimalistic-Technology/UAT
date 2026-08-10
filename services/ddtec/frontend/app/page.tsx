"use client";

import { Suspense } from "react";
import Hero from "./_components/Hero";
import WhatWeOffer from "./_components/WhatWeOffer";
import WhoWeAre from "./_components/WhoWeAre";
import FeaturedProducts from "./_components/FeaturedProducts";
import ShopSection from "./_components/ShopSection";
import Contact from "./_components/Contact";
import { useSettings } from "./_context/SettingsContext";

export default function HomePage() {
  const { isComponentEnabled } = useSettings();

  return (
    <main className="min-h-screen">
      {isComponentEnabled("Hero") && <Hero />}
      {isComponentEnabled("WhoWeAre") && <WhoWeAre />}
      {isComponentEnabled("WhatWeOffer") && <WhatWeOffer />}
      {isComponentEnabled("FeaturedProducts") && <FeaturedProducts />}
      {isComponentEnabled("ShopSection") && (
        <Suspense fallback={<div className="py-24 text-center text-slate-500">Loading products...</div>}>
          <ShopSection />
        </Suspense>
      )}
      {isComponentEnabled("Contact") && <Contact />}
    </main>
  );
}
