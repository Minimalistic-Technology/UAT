"use client";

import {
  Categories,
  EmployerCTA,
  FeaturedJobs,
  Footer,
  Hero,
  HowItWorks,
  Testimonials,
} from "@/features/landing/components";
import ComingSoonWrapper from "@/components/coming-soon-wrapper";
import { useGetLandingSettings } from "@/features/landing/hooks/use-settings";

export default function Home() {
  const { data, isLoading } = useGetLandingSettings();
  const settingsData = data?.data || {};

  return (
    <ComingSoonWrapper>
      <Hero />
      {/* <TrustedBy /> */}
      <Categories categories={settingsData.categories} />
      <FeaturedJobs jobs={settingsData.jobs} />
      <HowItWorks />
      {/* <Stats /> */}
      {/* <Testimonials /> */}
      <EmployerCTA />
      <Footer />
    </ComingSoonWrapper>
  );
}

