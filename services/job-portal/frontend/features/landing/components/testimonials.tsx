"use client"
import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Maya Iyer",
    role: "Senior PM at Vercel",
    img: "https://images.unsplash.com/photo-1617726341532-11680535062e?auto=format&fit=crop&q=80&w=150&h=150",
    quote:
      "I stopped using every other job board two weeks into Hireloop. The matches were embarrassingly good — I heard back on 8 of 10 apps.",
    accent: "indigo",
  },
  {
    name: "Daniel Oduya",
    role: "Staff Engineer, Ramp",
    img: "https://images.unsplash.com/photo-1617726341472-ffff3dd33ee0?auto=format&fit=crop&q=80&w=150&h=150",
    quote:
      "Clean listings. Real salaries. Zero recruiter spam. Signed my offer 19 days after creating my profile.",
    accent: "blue",
  },
  {
    name: "Priya Sharma",
    role: "Head of Talent, Linear",
    img: "https://images.unsplash.com/photo-1617726341407-e61fff6868fc?auto=format&fit=crop&q=80&w=150&h=150",
    quote:
      "Our time-to-hire dropped by 41% in the first quarter. The candidate quality speaks for itself.",
    accent: "indigo",
  },
];

const EASE = [0.22, 1, 0.36, 1];

export const Testimonials = () => {
  return (
    <section
      className="py-24 md:py-32 bg-white"
      data-testid="testimonials-section"
    >
      <div className="max-w-[88rem] mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-black text-indigo-600">
              Loved by both sides
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl mt-4 text-slate-900 font-bold tracking-tight leading-[1.1]">
              Stories from real <br className="hidden md:block" />
              <span className="text-indigo-600">hires & hiring teams.</span>
            </h2>
          </div>
          
          <div 
            className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100"
            aria-label="Rated 4.9 stars by 2100 users"
          >
            <div className="flex items-center -space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className="fill-indigo-600 text-indigo-600"
                />
              ))}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 leading-none">4.9/5.0</span>
              <span className="text-xs text-slate-500 mt-1">2,100+ reviews</span>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid md:grid-cols-3 gap-8"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.name}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
              }}
              className="group relative flex flex-col p-8 md:p-10 bg-white border border-slate-200 rounded-[2rem] hover:border-indigo-600 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300"
              data-testid={`testimonial-${i}`}
            >
              <div className={`mb-6 ${t.accent === "indigo" ? "text-indigo-600" : "text-blue-600"}`}>
                <Quote size={32} fill="currentColor" className="opacity-20" />
              </div>

              <blockquote className="flex-grow">
                <p className="text-lg md:text-xl text-slate-900 leading-relaxed font-semibold tracking-tight">
                  “{t.quote}”
                </p>
              </blockquote>

              <div className="mt-10 pt-8 border-t border-slate-50 flex items-center gap-4">
                <img
                  src={t.img}
                  alt={`Portrait of ${t.name}`}
                  className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ring-2 ring-transparent group-hover:ring-indigo-100"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="font-bold text-slate-900">{t.name}</div>
                  <div className="text-sm font-medium text-slate-500 tracking-tight">{t.role}</div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};