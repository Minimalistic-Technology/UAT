"use client";

import React, { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Hero from "./Hero";
import Pricing from "./Pricing";
import ContactForm from "./ContactForm";
import WhatWeOffer from "./WhatWeOffer";
import { cn } from "@/lib/utils";

export default function HomeClient() {
  const revealScale = {
    initial: { opacity: 0, y: 100 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className={cn(
            "flex size-16 items-center justify-center rounded-full bg-primary",
            "animate-pulse shadow-[0_0_20px_rgba(0,0,0,0.2)] shadow-primary/80",
          )}
        >
          <span className="text-xl font-bold text-black">
            MT
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Hero />

      <div className="section-spacing">
        <WhatWeOffer />
      </div>

      <motion.div {...revealScale}>
        <Pricing />
      </motion.div>

      <motion.div {...revealScale}>
        <Suspense
          fallback={
            <div className="py-20 text-center">Loading contact form...</div>
          }
        >
          <ContactForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
