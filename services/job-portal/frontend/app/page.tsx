import { Categories } from "@/features/landing/components/categories";
import { EmployerCTA } from "@/features/landing/components/employer-cta";
import { FeaturedJobs } from "@/features/landing/components/featured-jobs";
import { Footer } from "@/features/landing/components/footer";
import { Hero } from "@/features/landing/components/hero";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { Stats } from "@/features/landing/components/stats";
import { Testimonials } from "@/features/landing/components/testimonials";
import { TrustedBy } from "@/features/landing/components/trusted-by";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <Categories />
      <FeaturedJobs />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <EmployerCTA />
      <Footer />
    </>
  );
}
