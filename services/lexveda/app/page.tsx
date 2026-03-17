"use client";
import {
  HeroSection,
  ServicesSection,
  HowItWorksSection,
  PricingSection,
  TrustSection,
  RequestForm,
  WhyChooseSection,
  ComingSoon,
  Navbar,
} from "@/components/index";
import { useEffect, useState } from "react";
import { Footer } from "react-day-picker";

export default function Home() {
  const releaseDate = new Date("2026-03-17T23:51:00");
  console.log("release date", releaseDate.toLocaleString());

  const [isReleased, setIsReleased] = useState(new Date() >= releaseDate);

  useEffect(() => {
    if (isReleased) return;

    const checkRelease = () => {
      if (new Date() >= releaseDate) {
        const FIREWORKS_START_TIME_KEY = "fireworks_start_time";
        const now = Date.now();
        localStorage.setItem(FIREWORKS_START_TIME_KEY, now.toString());
        setIsReleased(true);
      }
    };
    const timer = setInterval(checkRelease, 1000);
    return () => clearInterval(timer);
  }, [isReleased, releaseDate]);

  if (!isReleased) {
    return <ComingSoon />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <WhyChooseSection />
      <RequestForm />
      <PricingSection />
      <TrustSection />
      <Footer />
    </div>
  );
}
