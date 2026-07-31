"use client";
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
      className="bg-white py-24 md:py-32"
      data-testid="testimonials-section"
    >
      <div className="mx-auto max-w-[88rem] px-6 md:px-12">
        {/* Header Section */}
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase md:text-xs">
              Loved by both sides
            </span>
            <h2 className="mt-4 text-4xl leading-[1.1] font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Stories from real <br className="hidden md:block" />
              <span className="text-blue-600">hires & hiring teams.</span>
            </h2>
          </div>

          {/* <div
            className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4"
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
              <span className="leading-none font-bold text-slate-900">
                4.9/5.0
              </span>
              <span className="mt-1 text-xs text-slate-500">
                2,100+ reviews
              </span>
            </div>
          </div> */}
        </div>

        {/* Testimonials Grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid gap-8 md:grid-cols-3"
        >
          {isLoading
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex h-80 animate-pulse flex-col rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10"
                >
                  <div className="mb-6 h-12 w-12 rounded-full bg-slate-200" />
                  <div className="flex-grow space-y-3">
                    <div className="h-4 w-full rounded bg-slate-200" />
                    <div className="h-4 w-5/6 rounded bg-slate-200" />
                    <div className="h-4 w-4/6 rounded bg-slate-200" />
                  </div>
                  <div className="mt-10 flex items-center gap-4 border-t border-slate-50 pt-8">
                    <div className="h-12 w-12 rounded-full bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-3 w-24 rounded bg-slate-200" />
                      <div className="h-2 w-32 rounded bg-slate-200" />
                    </div>
                  </div>
                </div>
              ))
            : testimonials?.map((t: any, i: number) => {
                const name = t.authorName;
                const role = [t.authorRole, t.authorCompany].filter(Boolean).join(" at ") || "User";
                const img =
                  t.user?.avatarUrl ||
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
                    className="group relative flex flex-col rounded-[2rem] border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-100 md:p-10"
                    data-testid={`testimonial-${i}`}
                  >
                    <div
                      className={`mb-6 ${
                        accent === "indigo"
                          ? "text-indigo-600"
                          : "text-blue-600"
                      }`}
                    >
                      <Quote
                        size={32}
                        fill="currentColor"
                        className="opacity-20"
                      />
                    </div>

                    <blockquote className="flex-grow">
                      <p className="text-lg leading-relaxed font-semibold tracking-tight text-slate-900 md:text-xl">
                        “{quote}”
                      </p>
                    </blockquote>

                    <div className="mt-10 flex items-center gap-4 border-t border-slate-50 pt-8">
                      <img
                        src={img}
                        alt={`Portrait of ${name}`}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-transparent grayscale transition-all duration-500 group-hover:ring-indigo-100 group-hover:grayscale-0"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{name}</div>
                        <div className="text-sm font-medium tracking-tight text-slate-500">
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
