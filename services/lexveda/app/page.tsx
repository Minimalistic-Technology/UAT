import {
  HeroSection,
  ServicesSection,
  HowItWorksSection,
  PricingSection,
  TrustSection,
  RequestForm,
  WhyChooseSection,
} from "@/components/index";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <WhyChooseSection />
      <RequestForm />
      <PricingSection />
      <TrustSection />
    </>
  );
}
