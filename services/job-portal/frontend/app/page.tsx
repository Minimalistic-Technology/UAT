import {
  Categories,
  EmployerCTA,
  FeaturedJobs,
  Footer,
  Hero,
  HowItWorks,
  Stats,
  Testimonials,
  TrustedBy,
} from "@/features/landing/components";

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
