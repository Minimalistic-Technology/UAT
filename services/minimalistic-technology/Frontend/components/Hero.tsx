'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Globe, Shield } from 'lucide-react';

const Hero: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 300]);
  const y2 = useTransform(scrollY, [0, 800], [0, -200]);
  const rotate = useTransform(scrollY, [0, 800], [0, 15]);

  const scrollToForm = () => {
    const el = document.getElementById('contact-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  });

  const pills = [
    { icon: <Zap size={13} />, label: 'Ultra Fast' },
    { icon: <Globe size={13} />, label: 'Edge Scale' },
    { icon: <Shield size={13} />, label: 'Elite Security' },
  ];

  return (
    <section className="relative min-h-[calc(100vh-112px)] pt-15 lg:pt-10 flex items-center bg-background overflow-hidden">
      {/* Immersive Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />

        {/* Massive Mesh Gradients */}
        <motion.div
          style={{ y: y1 }}
          className="absolute -top-[20%] -right-[10%] w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[150px]"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute top-[40%] -left-[10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]"
        />
      </div>

      <div className="max-w-[1280px] mx-auto px-[clamp(1.5rem,5vw,4rem)] relative z-10 w-full min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-20 lg:gap-24 text-center lg:text-left py-20 lg:py-[clamp(60px,10vw,120px)]">

          {/* ── Left: Copy ── */}
          <div className="flex flex-col items-center lg:items-start">
            <motion.h1 className="text-[clamp(3.5rem,8vw,6rem)] leading-[0.9] font-black tracking-[-0.05em] mb-10 text-[var(--text-bright)]">
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="block text-[var(--text-main)]"
              >
                Build Websites
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.5 }}
                className="bg-[linear-gradient(135deg,hsl(82,84%,50%),hsl(82,84%,35%))] bg-clip-text text-transparent block"
              >
                Effortlessly
              </motion.span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.6)}
              className="text-xl md:text-2xl text-[var(--text-main)] font-bold mb-4 opacity-90 tracking-tight"
            >
              From Idea to Live Website — We Make It Seamless
            </motion.p>

            <motion.p
              {...fadeUp(0.7)}
              className="text-lg text-neutral-400 mb-12 max-w-lg leading-relaxed opacity-50 font-medium"
            >
              No coding needed | AI powered design | Fast deployment
            </motion.p>

            <motion.div {...fadeUp(0.8)} className="flex items-center gap-8 flex-wrap">
              <button
                onClick={scrollToForm}
                className="relative inline-flex items-center justify-center px-8 lg:px-12 py-4 lg:py-5 bg-primary text-black font-bold rounded-2xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] hover:shadow-[0_20px_40px_rgba(132,204,22,0.15)] hover:bg-[#9de02b] z-10 group"
              >
                Start Building
                <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* ── Right: Visual Composite ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.9, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="hero-card-wrapper perspective-[2000px]"
          >
            <motion.div
              className="relative rounded-[48px] overflow-hidden border border-[var(--border)] shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2670&auto=format&fit=crop"
                alt="Elite Engineering"
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
