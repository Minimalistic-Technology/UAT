import { Quote } from "lucide-react";

export const metadata = { title: "Testimonials" };

export default function TestimonialsPage() {
    const reviews = [
        { name: "Alex R.", role: "Senior Frontend Engineer", q: "The only platform I recommend to juniors. Zero ads, zero fluff. Straight to the point engineering." },
        { name: "Sarah M.", role: "CTO at TechFlow", q: "Minimalistic Learning's focus on architecture without the noise has completely changed how our team approaches onboarding." },
        { name: "David K.", role: "Independent Consultant", q: "A breath of fresh air in an otherwise incredibly noisy tech ed-space. Their UI/UX alone is worth studying." },
        { name: "Maya J.", role: "Fullstack Developer", q: "I learned more here in 3 focused hours than in 3 weeks of standard video courses." },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-foreground tracking-tighter mb-6">What They <span className="text-amber-500">Say</span></h1>
                <p className="text-lg text-foreground/70 font-medium">Hear from the 12,000+ top-tier developers who use our platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviews.map((r, i) => (
                    <div key={i} className="p-8 sm:p-10 rounded-[2rem] bg-theme-element border border-theme-accent/10 hover:border-amber-500/30 transition-all duration-300 relative">
                        <Quote size={40} className="text-amber-500/20 absolute top-8 right-8" />
                        <p className="text-lg sm:text-xl font-semibold text-foreground/90 leading-relaxed mb-8 relative z-10">"{r.q}"</p>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-full bg-theme-element-sec border border-theme-accent/20 flex items-center justify-center text-foreground font-black shadow-inner">
                                {r.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-black text-foreground">{r.name}</h4>
                                <p className="text-xs font-bold text-theme-action uppercase tracking-widest">{r.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
