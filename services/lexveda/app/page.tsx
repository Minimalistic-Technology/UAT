import {
  HeroSection,
  ServicesSection,
  RequestForm,
  WhyChooseSection,
  Navbar,
  Footer,
  ContactUs,
} from "@/components/index";
import TermsModal from "@/components/terms-modal";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <TermsModal />
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <ContactUs />
      <WhyChooseSection />
      <RequestForm />
      <Footer />
    </div>
  );
}
