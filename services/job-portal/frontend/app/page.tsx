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

export default function Home() {
  return (
    <ComingSoonWrapper>
      <Hero />
      {/* <TrustedBy /> */}
      <Categories />
      <FeaturedJobs />
      <HowItWorks />
      {/* <Stats /> */}
      {/* <Testimonials /> */}
      <EmployerCTA />
      <Footer />
    </ComingSoonWrapper>
  );
}

