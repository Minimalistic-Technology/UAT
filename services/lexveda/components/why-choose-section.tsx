import { Gavel, ShieldCheck, Lock, MessageCircle, ClipboardCheck, Clock } from "lucide-react";

const reasons = [

  { icon: Gavel, text: "Strict Client Confidentiality" },
  { icon: ClipboardCheck, text: "Clear Communication" },
  { icon: Clock, text: "Professional Legal Review" },

  { icon: Lock, text: "Guided By Practicing Advocates" },
  { icon: MessageCircle, text: "Hassel Free Process" },
  { icon: ShieldCheck, text: "Direct Access Legal Professionals" },
];

const WhyChooseSection = () => {
  return (
    <section id="why-lexveda" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Why Choose LexVeda
          </h2>
          <div className="gold-divider mb-6" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reasons.map((r) => (
            <div
              key={r.text}
              className="flex flex-col items-center text-center p-6 border border-border rounded-sm hover:border-accent/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <r.icon className="w-5 h-5 text-accent" />
              </div>
              <p className="font-sans text-sm font-semibold text-foreground leading-snug">
                {r.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
