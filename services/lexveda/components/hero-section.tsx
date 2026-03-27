import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-primary overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5 z-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, hsl(42 65% 52% / 0.1) 35px, hsl(42 65% 52% / 0.1) 36px)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-24 pb-16">
        <div className="max-w-3xl">
          {/* Trust badge */}
         

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground leading-tight mb-6">
            Future of Legal Services and{" "}
            <span className="text-accent"> Consultation</span>
          </h1>

          <div className="gold-divider-left mb-8" />

          <p className="text-base md:text-lg lg:text-xl font-sans text-muted-foreground leading-relaxed max-w-4xl mb-8">
            LexVeda is a modern legal platform that simplifies access to expert
            legal support. It offers convenient online consultations and
            seamless assistance, connecting individuals and businesses with
            experienced professionals for reliable and stress-free legal
            guidance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="gold"
              size="lg"
              className="text-base px-8 py-6"
              asChild
            >
              <a href="#draft-form">Raise Query</a>
            </Button>
            <Button
              variant="gold-outline"
              size="lg"
              className="text-base px-8 py-6"
              asChild
            >
              <a href="#consultation-form">Book Online Consultation</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative gold line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-accent to-transparent" />
    </section>
  );
};

export default HeroSection;
