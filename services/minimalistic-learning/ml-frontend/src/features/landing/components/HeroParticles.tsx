"use client";

import { motion } from "motion/react";

const PARTICLES = [
  { id: 0, size: 10, left: 8, top: 18, dur: 8, delay: 0 },
  { id: 1, size: 6, left: 18, top: 72, dur: 11, delay: 1.5 },
  { id: 2, size: 14, left: 30, top: 35, dur: 7, delay: 0.8 },
  { id: 3, size: 8, left: 48, top: 82, dur: 10, delay: 2 },
  { id: 4, size: 5, left: 62, top: 15, dur: 9, delay: 0.3 },
  { id: 5, size: 12, left: 75, top: 58, dur: 6, delay: 3 },
  { id: 6, size: 7, left: 88, top: 30, dur: 12, delay: 1 },
  { id: 7, size: 9, left: 92, top: 78, dur: 8, delay: 2.5 },
];

export const HeroParticles = () => {
  return (
    <>
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="bg-theme-action/20 pointer-events-none absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, -24],
            rotate: [0, 6],
            opacity: [0.25, 0.7],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </>
  );
};
