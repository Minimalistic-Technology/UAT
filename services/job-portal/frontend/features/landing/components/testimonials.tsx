"use client"
import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";
import { useFetchTestimonials } from "../hooks/use-testimonial";



export const Testimonials = () => {
  const { data: testimonials, isLoading, isError } = useFetchTestimonials(3);

  if (isError) {
    return null; // Handle error gracefully (hide section)
  }

  return (
    <section
      className="py-24 md:py-32 bg-white"
      data-testid="testimonials-section"
    >
      <div className="max-w-[88rem] mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-black text-blue-600">
              Loved by both sides
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl mt-4 text-slate-900 font-bold tracking-tight leading-[1.1]">
              Stories from real <br className="hidden md:block" />
              <span className="text-blue-600">hires & hiring teams.</span>
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
          {isLoading
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col p-8 md:p-10 bg-white border border-slate-200 rounded-[2rem] animate-pulse h-80"
                >
                  <div className="mb-6 w-12 h-12 bg-slate-200 rounded-full" />
                  <div className="flex-grow space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-full" />
                    <div className="h-4 bg-slate-200 rounded w-5/6" />
                    <div className="h-4 bg-slate-200 rounded w-4/6" />
                  </div>
                  <div className="mt-10 pt-8 border-t border-slate-50 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-24" />
                      <div className="h-2 bg-slate-200 rounded w-32" />
                    </div>
                  </div>
                </div>
              ))
            : testimonials?.map((t: any, i: number) => {
                const name = `${t.user.firstName} ${t.user.lastName}`;
                const role = t.user.role || "User";
                const img =
                  t.user.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
                const quote = t.content;
                const accent = i % 2 === 0 ? "indigo" : "blue";

                return (
                  <motion.article
                    key={t.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.6, ease: "easeIn" },
                      },
                    }}
                    className="group relative flex flex-col p-8 md:p-10 bg-white border border-slate-200 rounded-[2rem] hover:border-indigo-600 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300"
                    data-testid={`testimonial-${i}`}
                  >
                    <div
                      className={`mb-6 ${
                        accent === "indigo" ? "text-indigo-600" : "text-blue-600"
                      }`}
                    >
                      <Quote
                        size={32}
                        fill="currentColor"
                        className="opacity-20"
                      />
                    </div>

                    <blockquote className="flex-grow">
                      <p className="text-lg md:text-xl text-slate-900 leading-relaxed font-semibold tracking-tight">
                        “{quote}”
                      </p>
                    </blockquote>

                    <div className="mt-10 pt-8 border-t border-slate-50 flex items-center gap-4">
                      <img
                        src={img}
                        alt={`Portrait of ${name}`}
                        className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ring-2 ring-transparent group-hover:ring-indigo-100"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{name}</div>
                        <div className="text-sm font-medium text-slate-500 tracking-tight">
                          {role}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
        </motion.div>
      </div>
    </section>
  );
};