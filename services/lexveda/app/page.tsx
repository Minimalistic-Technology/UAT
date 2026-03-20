import {
  HeroSection,
  ServicesSection,
  RequestForm,
  WhyChooseSection,
  Navbar,
  Footer
} from "@/components/index";

export default function Home() {

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <WhyChooseSection />
      <RequestForm />
      <Footer />
    </div>
    // <ComingSoon />
  );
}
