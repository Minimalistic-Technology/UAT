'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Palette, Zap, Headset, ArrowRight, Cloud } from 'lucide-react';

const WhatWeOffer: React.FC = () => {
  const scrollToForm = () => {
    const element = document.getElementById('contact-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const offerings = [
    {
      icon: <Cpu size={32} />,
      title: "Ready to Use Template",
      description: "Generate layout tailored to your needs"
    },
    {
      icon: <Palette size={32} />,
      title: "Custom UI/UX Design",
      description: "Crafted by expert designers"
    },
    {
      icon: <Cloud size={32} />, // Added Cloud service
      title: "Cloud Infrastructure",
      description: "Scalable, secure, and high-uptime hosting"
    },
    {
      icon: <Zap size={32} />,
      title: "Fast Deployment",
      description: "Get your site live in 6 weeks"
    },
    {
      icon: <Headset size={32} />,
      title: "24/7 Support",
      description: "We're here whenever you need help"
    }
  ];

  return (
  <section id="services" className="py-24">
    <div className="max-w-[1280px] mx-auto px-[clamp(1.5rem,5vw,4rem)]">
      <h2 className="text-[2.5rem] font-black text-[var(--text-main)] mb-24 text-center max-[768px]:text-[2rem]">
        What We Offer
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-24 justify-items-center">
        {offerings.map((offering, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center group max-w-[300px]"
          >
            <div className="w-12 h-12 text-primary mb-6">
              {offering.icon}
            </div>
            <h3 className="text-[1.1rem] font-black text-[var(--text-main)] mb-3 tracking-tight">
              {offering.title}
            </h3>
            <p className="text-[var(--text-dim)] opacity-50 text-[0.85rem] leading-relaxed font-medium">
              {offering.description}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-12 pb-12">
        <button onClick={scrollToForm} className="relative inline-flex items-center justify-center px-8 lg:px-12 py-4 lg:py-5 bg-primary text-black font-bold rounded-2xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] hover:shadow-[0_20px_40px_rgba(132,204,22,0.15)] hover:bg-[#9de02b] z-10">
          Try Now
        </button>
      </div>
    </div>
  </section>
);
};

export default WhatWeOffer;
