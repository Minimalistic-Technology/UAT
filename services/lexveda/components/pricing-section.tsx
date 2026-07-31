import { Button } from "@/components/ui/button";

const PricingSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
          Service Details & Pricing
        </h2>
        <div className="gold-divider mb-8" />
        <div className="bg-card border border-border rounded-sm p-10">
          <p className="text-lg font-sans text-muted-foreground italic leading-relaxed mb-6">
            "For service details and pricing information, please submit a request."
          </p>
          <Button variant="gold" asChild>
            <a href="#request-form">Get in Touch</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
