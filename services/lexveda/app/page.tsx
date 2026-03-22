import {
  HeroSection,
  ServicesSection,
  RequestForm,
  WhyChooseSection,
  Navbar,
  Footer,
  ContactUs,
  CommitmentsSection,
} from "@/components/index";
import TermsModal from "@/components/terms-modal";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <TermsModal />
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <CommitmentsSection />
      <ContactUs />
      <WhyChooseSection />
      <RequestForm />
      <Footer />
    </div>
  );
}
