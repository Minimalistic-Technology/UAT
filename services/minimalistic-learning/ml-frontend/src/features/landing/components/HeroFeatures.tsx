import Link from "next/link";
import { ArrowRight, Zap, Shield, Users, Sparkles } from "lucide-react";
import { Tilt } from "@/components/ui/tilt";
import { Reveal } from "@/components/ui/reveal";

export const HeroFeatures = ({ heroContent }: { heroContent?: any }) => {
  const heroCards = [
    {
      delay: 0,
      hoverBorderClass: "hover:border-theme-action/30",
      blobClass:
        "-top-20 -right-20 bg-theme-action/10 group-hover:bg-theme-action/20",
      iconClass:
        "bg-theme-action/10 border-theme-action/20 text-theme-action group-hover:rotate-6",
      textClass: "text-theme-action",
      icon: Shield,
      stat: heroContent?.c1Stat || "100%",
      statLabel: heroContent?.c1StatLabel || "Ad & Noise Free",
      title: heroContent?.c1Title || "Focus on Core",
      desc:
        heroContent?.c1Desc ||
        "We radically strip away the noise. Every piece of content is engineered for maximum clarity and depth.",
    },
    {
      delay: 100,
      hoverBorderClass: "hover:border-amber-500/30",
      blobClass:
        "-bottom-20 -left-20 bg-amber-500/10 group-hover:bg-amber-500/20",
      iconClass:
        "bg-amber-500/10 border-amber-500/20 text-amber-500 group-hover:-rotate-6",
      textClass: "text-amber-500",
      icon: Zap,
      stat: heroContent?.c2Stat || "4.9★",
      statLabel: heroContent?.c2StatLabel || "Average Rating",
      title: heroContent?.c2Title || "Uncompromising Quality",
      desc:
        heroContent?.c2Desc ||
        "Our editorial standards are absolute. Content only makes it through if it genuinely provides actionable value.",
    },
    {
      delay: 200,
      hoverBorderClass: "hover:border-emerald-500/30",
      blobClass:
        "-right-20 -bottom-20 bg-emerald-500/10 group-hover:bg-emerald-500/20",
      iconClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
      textClass: "text-emerald-500",
      icon: Users,
      stat: heroContent?.c3Stat || "12k+",
      statLabel: heroContent?.c3StatLabel || "Active Members",
      title: heroContent?.c3Title || "Elite Peer Community",
      desc:
        heroContent?.c3Desc ||
        "Growth accelerates around the right people. Connect with ambitious developers dedicated to deep mastery.",
    },
  ];

  return (
    <section className="bg-theme-element-sec border-theme-accent/10 relative w-full overflow-hidden border-t px-4 py-8 transition-colors duration-500 sm:px-6 lg:px-8">
      {/* Decorative Grid Lines in Background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-theme-accent)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-theme-accent)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_10%,transparent_100%)] bg-[size:6rem_6rem] opacity-5"></div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section header */}
        <Reveal dir="up">
          <div className="mb-16 text-center sm:mb-20">
            <div className="from-theme-action/50 mb-6 inline-flex items-center justify-center rounded-full bg-linear-to-r to-purple-500/50 p-px">
              <div className="bg-theme-element-sec flex items-center gap-2 rounded-full px-4 py-1.5">
                <Sparkles size={14} className="text-theme-action" />
                <span className="text-foreground/80 text-xs font-black tracking-widest uppercase">
                  {heroContent?.advantageBadge || "The Advantage"}
                </span>
              </div>
            </div>

            <h2 className="text-foreground text-4xl leading-[1.05] font-black tracking-tighter sm:text-5xl lg:text-[4rem]">
              {heroContent?.advantageTitle1 || "Why choose"}{" "}
              <br className="sm:hidden" />
              <span className="text-theme-action">
                {heroContent?.advantageTitle2 || "Minimalistic?"}
              </span>
            </h2>
          </div>
        </Reveal>

        {/* ── PREMIUM HORIZONTAL GRID ── */}
        <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {heroCards.map((card, idx) => (
            <div key={idx} className="h-full">
              <Reveal delay={card.delay} dir="up">
                <Tilt className="h-full">
                  <div
                    className={`group bg-background border-theme-accent/15 relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border p-8 shadow-sm transition-all duration-500 hover:shadow-2xl sm:p-10 ${card.hoverBorderClass}`}
                  >
                    <div
                      className={`absolute h-64 w-64 rounded-full blur-[80px] transition-all duration-700 ${card.blobClass}`}
                    ></div>

                    <div>
                      <div className="relative z-10 mb-8 flex items-start justify-between">
                        <div
                          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] border shadow-inner transition-all duration-500 ${card.iconClass}`}
                        >
                          <card.icon size={28} />
                        </div>
                        <div className="text-right">
                          <h3 className="text-foreground mb-1 text-3xl font-black tracking-tighter sm:text-4xl">
                            {card.stat}
                          </h3>
                          <p
                            className={`text-[10px] leading-tight font-bold tracking-widest uppercase ${card.textClass}`}
                          >
                            {card.statLabel}
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-foreground mb-3 text-2xl font-black">
                          {card.title}
                        </h3>
                        <p className="text-foreground/70 text-base leading-relaxed font-medium">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </Reveal>
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <Reveal dir="up" delay={300}>
          <div className="bg-foreground text-background group relative mt-16 flex flex-col items-center justify-between gap-10 overflow-hidden rounded-[2.5rem] px-8 py-12 shadow-2xl sm:mt-24 md:flex-row lg:p-16">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay dark:opacity-10"></div>
            <div className="bg-theme-action/30 absolute top-[-50%] right-[-10%] h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-1000 group-hover:bg-purple-500/40"></div>

            <div className="relative z-10 text-center md:text-left">
              <h3 className="mb-4 text-3xl font-black tracking-tight drop-shadow-sm sm:text-4xl lg:text-5xl">
                {heroContent?.ctaTitle || "Commit to Mastery"}
              </h3>
              <p className="text-background/80 max-w-xl text-lg font-medium">
                {heroContent?.ctaSubtitle ||
                  "Join the definitive platform built strictly for focused developers avoiding the modern noise."}
              </p>
            </div>
            <Link
              href="/register"
              className="group/btn bg-theme-action shadow-theme-action/20 relative z-10 flex w-full shrink-0 items-center justify-center gap-3 rounded-2xl px-10 py-5 text-sm font-black text-white shadow-xl transition-all hover:opacity-90 md:w-auto lg:text-base"
            >
              Join the Platform
              <ArrowRight
                size={20}
                className="transition-transform group-hover/btn:translate-x-1"
              />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
