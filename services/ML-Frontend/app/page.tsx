"use client";

import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
        Minimalistic <span className="text-[#2563EB]">Learning.</span>
      </h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-lg mb-8">
        Clinical Learning Systems redefined for absolute clarity and focus. Please sign in or join to continue.
      </p>
    </div>
  );
}
