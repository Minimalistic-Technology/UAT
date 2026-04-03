"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Play } from 'lucide-react';

const BackgroundCloud = ({ className, opacity = 0.8 }: { className?: string, opacity?: number }) => (
  <svg viewBox="0 0 326 211" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ opacity }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M124.629 0.4076C90.2868 -3.12596 58.1132 17.5192 45.4526 49.0305C19.0494 54.0628 0 77.0654 0 104.996C0 135.534 24.757 160.291 55.2954 160.291H284.187C307.29 160.291 326.018 141.564 326.018 118.461C326.018 97.433 310.493 80.0152 290.311 77.1062C281.821 34.6298 244.593 3.39867 200.75 3.39867C184.6 3.39867 169.524 8.01633 156.402 16.035C148.047 6.44297 137.054 1.68536 124.629 0.4076Z" fill="white" />
  </svg>
)

const EagleSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M500.6 166.4l-64.8 55.4L299.1 82.5 256 18c-30.8 77-84 153.2-140.4 200.7-32.5 27.4-66.2 55.4-96.1 83l-8.5-47.5L0 274.6l74.9 66.8c-1.3 35.8 4.4 75.8 21.6 108.9 44.5 86.2 135.2 121 216 57l-47.8-8c0 0 68.4-16.1 103-62.8L512 258.9l-11.4-92.5z" />
  </svg>
)

const FloatingEaglePill = ({ label, className }: { label: string, className: string }) => {
  return (
    <div className={`absolute flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10 ${className}`}>
      <EagleSVG className="w-8 h-8 text-gray-700/80 mb-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]" />
      <div className="flex gap-4 opacity-50 relative -mt-1 -mb-1">
        <div className="w-[1.5px] h-3 bg-gray-500 rotate-[20deg] origin-bottom translate-x-1" />
        <div className="w-[1.5px] h-3 bg-gray-500 -rotate-[20deg] origin-bottom -translate-x-1" />
      </div>
      <div className="bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-white/40 text-xs font-bold text-gray-700">
        {label}
      </div>
    </div>
  )
}

export const Hero = () => {
  return (
    <section
      className="relative w-full pt-32 md:pt-48 pb-24 overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 15% 25%, rgba(255,255,255,0.7) 0%, transparent 40%),
          radial-gradient(circle at 85% 20%, rgba(255,255,255,0.65) 0%, transparent 45%),
          radial-gradient(circle at 10% 70%, rgba(255,255,255,0.5) 0%, transparent 30%),
          radial-gradient(circle at 90% 65%, rgba(255,255,255,0.6) 0%, transparent 35%),
          linear-gradient(180deg, #A8CFFB 0%, #DCE9FB 40%, #ffffff 80%)
        `
      }}
    >
      {/* Fluffy Background Clouds */}
      <BackgroundCloud className="absolute -top-10 -left-20 w-[400px] sm:w-[600px] pointer-events-none z-0" opacity={0.65} />
      <BackgroundCloud className="absolute top-10 -right-32 w-[500px] sm:w-[700px] pointer-events-none z-0" opacity={0.7} />
      <BackgroundCloud className="absolute top-[400px] left-[-100px] w-[500px] pointer-events-none z-0" opacity={0.5} />
      <BackgroundCloud className="absolute top-[300px] right-[5%] w-[350px] pointer-events-none z-0" opacity={0.4} />
      {/* Floating Hashtag Pill Elements Carried by Eagles */}
      <FloatingEaglePill label="#Technology" className="top-48 left-[5%] md:left-[10%] -rotate-[8deg] animate-[bounce_8s_infinite]" />
      <FloatingEaglePill label="#Software" className="top-[280px] left-[2%] md:left-[5%] rotate-[6deg] animate-[bounce_9s_infinite]" />
      <FloatingEaglePill label="#Coding" className="top-[340px] left-[15%] md:left-[20%] -rotate-[12deg] animate-[bounce_10s_infinite]" />

      <FloatingEaglePill label="#Productivity" className="top-44 right-[5%] md:right-[15%] rotate-[10deg] animate-[bounce_10s_infinite]" />
      <FloatingEaglePill label="#Design" className="top-[260px] right-[2%] md:right-[5%] -rotate-[6deg] animate-[bounce_8s_infinite]" />
      <FloatingEaglePill label="#Creativity" className="top-[350px] right-[15%] md:right-[22%] rotate-[8deg] animate-[bounce_9s_infinite]" />

      {/* Main Center Area */}
      <div className="relative z-20 max-w-5xl mx-auto px-[5%] flex flex-col items-center text-center mt-2 md:mt-6">
        {/* Concentric Circles Logo / Decal */}
        {/* <div className="mb-8 relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-white mix-blend-overlay flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-[1.5px] border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white opacity-80" />
            </div>
          </div>
        </div> */}

        {/* Huge Hero Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-bold text-[#080808] tracking-[-0.04em] leading-[1.05] mb-6">
          Minimalistic Learning
        </h1>

        {/* Sub headline */}
        <p className="text-gray-600 font-medium text-sm sm:text-base md:text-lg max-w-2xl mb-10 leading-relaxed md:leading-relaxed">
          Minimalistic Learning provides a distraction-free environment where curious minds can flourish and master new skills with total clarity.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <Link
            href="/blog/create"
            className="group flex items-center justify-center gap-2.5 px-8 pt-3 pb-3.5 bg-gradient-to-r from-[#94b3f9] to-[#1877F2] text-white rounded-full font-bold text-base hover:scale-[1.03] active:scale-95 transition-all shadow-[0_8px_20px_rgba(24,119,242,0.3)] shadow-[#1877F2]/30"
          >
            Get Started
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="flex items-center justify-center gap-3 px-8 pt-3 pb-3.5 bg-white text-gray-900 rounded-full font-bold text-base hover:scale-[1.03] active:scale-95 transition-all shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
            <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center">
              <BookOpen size={12} fill="currentColor" className="ml-0.5" />
            </div>
            Resources
          </button>
        </div>
      </div>

      {/* Lower Section (Why Choose Us) */}
      <div className="relative z-20 w-full px-[5%] mt-32 md:mt-48 text-left">
        <div className="flex flex-col lg:flex-row items-start justify-start gap-12 lg:gap-24">
          {/* Title Area */}
          <div className="border-l-2 border-[#1877F2] pl-6 md:pl-0 md:border-none flex flex-col justify-center min-w-[280px]">
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-gray-900 tracking-[-0.03em] leading-[1.1] mb-5">
              Why choose<br />
              <span className="text-gray-400 font-bold">Minimalistic?</span>
            </h2>
            <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-[280px]">
              Our readers choose our platform because of the high quality, distraction-free curation of education.
            </p>
          </div>

          {/* Core Feature 1 */}
          <div className="flex flex-col items-start pt-2">
            <div className="w-[60px] h-[60px] mb-6 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" fill="none">
                <path
                  fill="url(#gradFeature1)"
                  d="M20 50 Q 50 20 80 50 Q 50 80 20 50 Z"
                  className="animate-[spin_20s_linear_infinite]"
                />
                <circle cx="50" cy="50" r="15" fill="#ffffff" />
                <defs>
                  <linearGradient id="gradFeature1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#96C2F7" />
                    <stop offset="100%" stopColor="#1877F2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Focus on Core</h3>
            <p className="text-sm font-medium text-gray-500 leading-relaxed min-h-[60px]">
              We believe that learning should contribute to the full development of each individual, stripped of noise.
            </p>
          </div>

          {/* Core Feature 2 */}
          <div className="flex flex-col items-start pt-2">
            <div className="w-[60px] h-[60px] mb-6 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" fill="none">
                <path
                  fill="url(#gradFeature2)"
                  d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z"
                  className="animate-[pulse_4s_ease-in-out_infinite]"
                />
                <defs>
                  <linearGradient id="gradFeature2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A8CFFB" />
                    <stop offset="100%" stopColor="#1877F2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Community Driven</h3>
            <p className="text-sm font-medium text-gray-500 leading-relaxed min-h-[60px]">
              Our authors and readers are always ready to give each other a warm welcome and insightful feedback.
            </p>
          </div>
        </div>
      </div>

    </section>
  );
};
