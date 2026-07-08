"use client";

import React, { useState, useEffect } from "react";

// Set your target date here
const TARGET_DATE = new Date("2026-07-09T09:09:00").getTime(); // Tomorrow at 9:09 AM

export default function ComingSoonWrapper({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = TARGET_DATE - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setIsReady(true);
      }
    };

    calculateTimeLeft();
    const timerId = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timerId);
  }, []);

  // Avoid hydration mismatch by initially hiding or showing a loader, 
  // but since we want the coming soon immediately if not ready, we can just render it.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isReady) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white font-sans overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
      </div>
      
      <div className="z-10 flex flex-col items-center text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">
          We're Launching Soon
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12">
          Our platform is currently undergoing final preparations. Get ready for a revolutionary job portal experience!
        </p>

        <div className="flex gap-4 md:gap-8 justify-center">
          <TimeUnit value={timeLeft.days} label="Days" />
          <span className="text-4xl md:text-5xl font-light text-slate-600 mt-2">:</span>
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <span className="text-4xl md:text-5xl font-light text-slate-600 mt-2">:</span>
          <TimeUnit value={timeLeft.minutes} label="Minutes" />
          <span className="text-4xl md:text-5xl font-light text-slate-600 mt-2">:</span>
          <TimeUnit value={timeLeft.seconds} label="Seconds" />
        </div>
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-20 md:w-24 md:h-28 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-center shadow-xl backdrop-blur-sm relative overflow-hidden">
        {/* Shine effect */}
        <div className="absolute top-0 w-full h-1/2 bg-white/5" />
        <span className="text-3xl md:text-5xl font-bold text-white tracking-wider">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="mt-3 text-xs md:text-sm font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </span>
    </div>
  );
}
