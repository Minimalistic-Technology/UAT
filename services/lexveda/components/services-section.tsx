import { FileText, Reply, Video } from "lucide-react";

const services = [
  {
    icon: FileText,
    title: "Legal Notice Drafting",
    description:
      "Professional legal notices prepared by practising advocates based on the facts provided by the client. Request drafting through our online portal.",
  },
  {
    icon: Reply,
    title: "Reply to Legal Notice",
    description:
      "Structured and legally appropriate replies to notices. Our legal team will review your matter and prepare a professional response.",
  },
  {
    icon: Video,
    title: "Online Legal Consultation",
    description:
      "Clients can consult with practising advocates regarding their legal issues. Consultations are booked through our WhatsApp-integrated consultation form.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Our Services
          </h2>
          <div className="gold-divider mb-6" />
          <p className="text-muted-foreground font-sans max-w-xl mx-auto">
            Focused legal drafting services delivered with precision and professionalism.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {services.map((s) => (
            <div
              key={s.title}
              className="group bg-card border border-border rounded-sm p-8 hover:border-accent/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-sm bg-primary flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                <s.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
                {s.title}
              </h3>
              <p className="font-sans text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
