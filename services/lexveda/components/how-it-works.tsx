import { Upload, Users, FileCheck } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "Step 1",
    text: "Submit your request .",
  },
  {
    icon: Users,
    step: "Step 2",
    text: "Our legal team reviews the matter.",
  },
  {
    icon: FileCheck,
    step: "Step 3",
    text: "Receive a professionally drafted Legal Notice or Reply prepared according to legal standards.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4">
            How It Works
          </h2>
          <div className="gold-divider mb-6" />
          <p className="text-primary-foreground/70 font-sans max-w-xl mx-auto">
            A straightforward process from submission to delivery.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-accent flex items-center justify-center mx-auto mb-6">
                <s.icon className="w-7 h-7 text-accent" />
              </div>
              <span className="text-xs font-sans font-bold text-accent tracking-widest uppercase mb-2 block">
                {s.step}
              </span>
              <p className="font-sans text-primary-foreground/80 leading-relaxed">
                {s.text}
              </p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
