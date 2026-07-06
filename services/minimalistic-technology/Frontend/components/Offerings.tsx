'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Palette, Zap, Headphones, ArrowRight, Box } from 'lucide-react';

const offerings = [
  {
    icon: <Cpu size={24} />,
    title: "AI Engine Architecture",
    description: "Neural-optimized system designs that scale automatically with your global user base."
  },
  {
    icon: <Palette size={24} />,
    title: "Cinematic UI Design",
    description: "Artfully crafted interfaces that merge high-end visual storytelling with technical precision."
  },
  {
    icon: <Zap size={24} />,
    title: "Hyper-Fast Execution",
    description: "Deployment pipelines engineered for millisecond efficiency and zero-downtime reliability."
  },
  {
    icon: <Box size={24} />,
    title: "Modular Scalability",
    description: "Pure-logic components built to integrate seamlessly into any complex enterprise ecosystem."
  }
];

const Offerings: React.FC = () => {
  return (
    <section id="services" className="py-[clamp(60px,10vw,120px)] relative bg-[var(--background)]">
      <div className="max-w-[1280px] mx-auto px-[clamp(1.5rem,5vw,4rem)]">
        <div className="flex flex-col gap-24">

          {/* Header */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-primary text-[0.7rem] font-black uppercase tracking-[0.4em] mb-6 block"
            >
              Core Capabilities
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[clamp(2rem,6vw,4rem)] leading-[1.1] font-extrabold tracking-[-0.03em] mb-8 text-[var(--text-main)]"
            >
              Engineering <span className="bg-[linear-gradient(135deg,hsl(82,84%,50%),hsl(82,84%,35%))] bg-clip-text text-transparent">Dimensions</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-dim opacity-60 leading-relaxed text-lg"
            >
              Our architectural approach combines pure engineering logic with aesthetic vision to build high-performance digital ecosystems.
            </motion.p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offerings.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface border border-border p-8 lg:p-12 rounded-[32px] transition-all duration-400 hover:-translate-y-2 hover:border-border-bright hover:bg-surface-hover h-full min-h-[380px] flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-10 border border-primary/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all duration-500">
                    {item.icon}
                  </div>

                  <h3 className="text-xl font-black text-[var(--text-main)] mb-6 uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-dim text-sm opacity-50 leading-loose">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-primary text-[0.65rem] font-black uppercase tracking-[0.2em] mt-12 cursor-pointer group-hover:gap-5 transition-all">
                  Analyze Protocol
                  <ArrowRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Offerings;
