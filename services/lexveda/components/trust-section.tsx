import { Scale, ShieldCheck, Lock } from "lucide-react";

const badges = [
  { icon: Scale, text: "Prepared by Practising Advocates – Not AI" },
  { icon: ShieldCheck, text: "Court Ready Legal Drafting" },
  { icon: Lock, text: "Strict Confidentiality" },
];

const TrustSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Our Commitment
          </h2>
          <div className="gold-divider" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {badges.map((b) => (
            <div key={b.text} className="text-center p-8 border border-accent/30 rounded-sm bg-card">
              <div className="w-14 h-14 rounded-full border-2 border-accent flex items-center justify-center mx-auto mb-5">
                <b.icon className="w-6 h-6 text-accent" />
              </div>
              <p className="font-serif font-semibold text-foreground text-lg leading-snug">
                {b.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
