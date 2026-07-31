import { Quote } from "lucide-react";

export const metadata = { title: "Testimonials" };

const REVIEWS = [
  {
    name: "Alex R.",
    role: "Senior Frontend Engineer",
    q: "The only platform I recommend to juniors. Zero ads, zero fluff. Straight to the point engineering.",
  },
  {
    name: "Sarah M.",
    role: "CTO at TechFlow",
    q: "Minimalistic Learning's focus on architecture without the noise has completely changed how our team approaches onboarding.",
  },
  {
    name: "David K.",
    role: "Independent Consultant",
    q: "A breath of fresh air in an otherwise incredibly noisy tech ed-space. Their UI/UX alone is worth studying.",
  },
  {
    name: "Maya J.",
    role: "Fullstack Developer",
    q: "I learned more here in 3 focused hours than in 3 weeks of standard video courses.",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 w-full px-4 py-8 duration-700 sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-3xl text-center lg:mb-12">
        <h1 className="text-foreground mb-6 text-4xl font-black tracking-tighter md:text-5xl lg:text-7xl">
          What They <span className="text-amber-500">Say</span>
        </h1>
        <p className="text-foreground/70 text-lg font-medium">
          Hear from the 12,000+ top-tier developers who use our platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {REVIEWS.map((r, i) => (
          <div
            key={i}
            className="bg-theme-element border-theme-accent/10 relative rounded-[2rem] border p-8 transition-all duration-300 hover:border-amber-500/30 sm:p-10"
          >
            <Quote
              size={40}
              className="absolute top-8 right-8 text-amber-500/20"
            />
            <p className="text-foreground/90 relative z-10 mb-8 text-lg leading-relaxed font-semibold sm:text-xl">
              "{r.q}"
            </p>
            <div className="relative z-10 flex items-center gap-4">
              <div className="bg-theme-element-sec border-theme-accent/20 text-foreground flex h-12 w-12 items-center justify-center rounded-full border font-black shadow-inner">
                {r.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-foreground font-black">{r.name}</h4>
                <p className="text-theme-action text-xs font-bold tracking-widest uppercase">
                  {r.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
