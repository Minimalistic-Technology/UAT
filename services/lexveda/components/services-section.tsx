import {
  Landmark,
  Home,
  Briefcase,
  Users,
  Handshake,
  Scale,
  ShieldAlert,
} from "lucide-react";

const practiceAreas = [
  {
    id: 1,
    name: "Banking & Finance",
    icon: Landmark,
  },
  {
    id: 2,
    name: "Real Estate",
    icon: Home,
  },
  {
    id: 3,
    name: "Labour & Employment",
    icon: Briefcase,
  },
  {
    id: 4,
    name: "Family Law",
    icon: Users,
  },
  {
    id: 5,
    name: "Settlement",
    icon: Handshake,
  },
  {
    id: 6,
    name: "Civil Litigation",
    icon: Scale,
  },
  {
    id: 7,
    name: "Criminal Litigation",
    icon: ShieldAlert,
  },
];

const ServicesSection = () => {
  return (
    <section id="practice-areas" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Practice Areas
          </h2>
          <div className="gold-divider mb-6" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-6xl mx-auto">
          {practiceAreas.map((s) => (
            <div
              key={s.id}
              className="group flex items-center gap-3 sm:gap-4 md:gap-5 bg-card border border-border rounded-sm p-4 sm:p-5 md:p-6 hover:border-accent/50 transition-all duration-300 hover:shadow-lg"
            >
              {/* Icon */}
              <div className="size-10 sm:size-12 md:size-14 rounded-sm bg-primary flex items-center justify-center group-hover:bg-accent transition-colors shrink-0">
                <s.icon className="size-5 sm:size-5.5 md:size-6 text-primary-foreground" />
              </div>

              {/* Text */}
              <h3 className="text-base sm:text-lg md:text-xl font-serif font-semibold text-foreground leading-snug">
                {s.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
