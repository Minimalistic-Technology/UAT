"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Hammer,
  Wrench,
  Settings,
  Drill,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const heroSlides = [
  {
    id: 1,
    title: "Tools Built for",
    highlightText: "True Professionals",
    subtitle:
      "Experience precision-crafted power tools designed for maximum performance, unwavering reliability, and lifetime longevity.",
    badge: "Industrial Grade Excellence",
    image:
      "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=1600",
    ctaPrimaryText: "Shop Collection",
    ctaPrimaryLink: "/shop",
    ctaSecondaryText: "Explore Offerings",
    ctaSecondaryLink: "/what",
  },
  {
    id: 2,
    title: "Heavy Duty Power &",
    highlightText: "Unmatched Precision",
    subtitle:
      "Engineered to withstand extreme job site environments with high-torque brushless motors and ergonomic designs.",
    badge: "Next-Gen Power Tech",
    image:
      "https://images.pexels.com/photos/209251/pexels-photo-209251.jpeg?auto=compress&cs=tinysrgb&w=1600",
    ctaPrimaryText: "View Power Tools",
    ctaPrimaryLink: "/shop",
    ctaSecondaryText: "Who We Are",
    ctaSecondaryLink: "/who",
  },
  {
    id: 3,
    title: "Master Metalwork &",
    highlightText: "Cutting Solutions",
    subtitle:
      "Deliver effortless cuts, grinding, and shaping with advanced heat resistance and ultra-durable alloy blades.",
    badge: "High Performance Cutting",
    image:
      "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=1600",
    ctaPrimaryText: "Discover Equipment",
    ctaPrimaryLink: "/shop",
    ctaSecondaryText: "View Offerings",
    ctaSecondaryLink: "/what",
  },
  {
    id: 4,
    title: "Craftsman Precision",
    highlightText: "Hardware & Kits",
    subtitle:
      "Complete toolsets designed with non-slip ergonomic grips and aerospace-grade steel for uncompromising reliability.",
    badge: "Professional Workshop Grade",
    image:
      "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1600",
    ctaPrimaryText: "Browse Tool Kits",
    ctaPrimaryLink: "/shop",
    ctaSecondaryText: "Get In Touch",
    ctaSecondaryLink: "/contact",
  },
  {
    id: 5,
    title: "Innovative Engineering",
    highlightText: "For Heavy Duty Jobs",
    subtitle:
      "Empowering contractors and fabricators with smart diagnostic machinery and industrial construction solutions.",
    badge: "Industry Standard 2026",
    image:
      "https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&w=1600",
    ctaPrimaryText: "Explore Shop",
    ctaPrimaryLink: "/shop",
    ctaSecondaryText: "Learn More",
    ctaSecondaryLink: "/what",
  },
];

export default function Hero() {
  const router = useRouter();
  const pathname = usePathname();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef<number | null>(null);

  // Parallax mouse position setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const xPos = (e.clientX / innerWidth - 0.5) * 2;
      const yPos = (e.clientY / innerHeight - 0.5) * 2;
      x.set(xPos);
      y.set(yPos);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  // Carousel slide change triggers
  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto slide timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Touch Swipe navigation for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
    touchStartX.current = null;
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const sectionPaths = ["/shop", "/who", "/what", "/contact"];
    if (sectionPaths.includes(href)) {
      e.preventDefault();
      const sectionId = href.substring(1);
      if (pathname === "/") {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        sessionStorage.setItem("scroll-target", sectionId);
        router.push("/");
      }
    }
  };

  const currentSlide = heroSlides[currentIndex];

  const backgroundIcons = [
    { Icon: Hammer, top: "20%", left: "10%", rotate: 15, size: 48, depth: 20 },
    { Icon: Drill, top: "15%", left: "85%", rotate: -20, size: 56, depth: 30 },
    { Icon: Wrench, top: "70%", left: "15%", rotate: 45, size: 52, depth: 15 },
    { Icon: Settings, top: "80%", left: "80%", rotate: -10, size: 64, depth: 25 },
    { Icon: Hammer, top: "10%", left: "50%", rotate: 10, size: 40, depth: 10 },
    { Icon: Drill, top: "45%", left: "5%", rotate: -30, size: 48, depth: 35 },
    { Icon: Wrench, top: "50%", left: "90%", rotate: 10, size: 44, depth: 20 },
    { Icon: Settings, top: "90%", left: "40%", rotate: 20, size: 50, depth: 15 },
  ];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.05,
    }),
    center: {
      x: "0%",
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
        scale: { duration: 6, ease: "linear" as const }, // Gentle Ken Burns effect
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.05,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
      },
    }),
  };

  return (
    <section
      id="home"
      className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-20 group/hero select-none bg-slate-950"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Background Image Carousel Layer */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={currentSlide.image}
              alt={currentSlide.title}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient Overlays for High Legibility & Dark Theme Polish */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/50 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-teal-950/20 mix-blend-overlay z-10 pointer-events-none" />
      </div>

      {/* Floating Parallax Icons */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {backgroundIcons.map((item, index) => (
          <ParallaxIcon key={index} item={item} mouseX={mouseX} mouseY={mouseY} />
        ))}
      </div>

      {/* Dynamic Progress Bar at top of hero */}
      {isPlaying && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30 pointer-events-none overflow-hidden">
          <motion.div
            key={currentIndex}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "linear" }}
            className="h-full bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.8)]"
          />
        </div>
      )}

      {/* Hero Content Container */}
      <div className="container mx-auto px-6 relative z-20 text-center text-white pointer-events-none my-auto py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-4xl mx-auto pointer-events-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-sm font-medium mb-6 backdrop-blur-md shadow-lg shadow-teal-950/50">
              <Sparkles className="size-4 text-teal-400 animate-pulse" />
              <span>{currentSlide.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] drop-shadow-md">
              {currentSlide.title} <br />
              <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-teal-200 bg-clip-text text-transparent drop-shadow-sm">
                {currentSlide.highlightText}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow">
              {currentSlide.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={currentSlide.ctaPrimaryLink}
                onClick={(e) => handleScroll(e, currentSlide.ctaPrimaryLink)}
                className="w-full sm:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-full font-bold transition-all duration-300 shadow-xl shadow-teal-500/25 hover:shadow-teal-400/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 group cursor-pointer"
              >
                {currentSlide.ctaPrimaryText}
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={currentSlide.ctaSecondaryLink}
                onClick={(e) => handleScroll(e, currentSlide.ctaSecondaryLink)}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full font-semibold backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center cursor-pointer"
              >
                {currentSlide.ctaSecondaryText}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrow Controls */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/40 hover:bg-slate-900/80 border border-white/10 hover:border-teal-500/50 text-white/80 hover:text-white backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <ChevronLeft className="size-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/40 hover:bg-slate-900/80 border border-white/10 hover:border-teal-500/50 text-white/80 hover:text-white backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <ChevronRight className="size-6 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Bottom Controls Bar: Dots, Slide Index Counter, Play/Pause */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex flex-col sm:flex-row items-center justify-between px-8 max-w-6xl mx-auto pointer-events-none gap-4">
        {/* Play/Pause & Counter */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/60 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause Auto-play" : "Start Auto-play"}
            className="text-slate-300 hover:text-teal-400 transition-colors focus:outline-none"
          >
            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
          <span className="text-xs font-mono text-slate-300 tracking-wider">
            <span className="text-teal-400 font-bold">
              {String(currentIndex + 1).padStart(2, "0")}
            </span>{" "}
            / {String(heroSlides.length).padStart(2, "0")}
          </span>
        </div>

        {/* Thumbnail Preview / Indicator Pills */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-full p-1.5 backdrop-blur-md">
          {heroSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`relative h-2.5 rounded-full transition-all duration-500 focus:outline-none ${
                idx === currentIndex
                  ? "w-8 bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]"
                  : "w-2.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Parallax icon helper component
function ParallaxIcon({
  item,
  mouseX,
  mouseY,
}: {
  item: any;
  mouseX: any;
  mouseY: any;
}) {
  const x = useTransform(mouseX, [-1, 1], [-item.depth, item.depth]);
  const y = useTransform(mouseY, [-1, 1], [-item.depth, item.depth]);

  return (
    <motion.div
      className="absolute text-slate-500/20 dark:text-slate-700/30 pointer-events-none hidden sm:block"
      style={{
        left: item.left,
        top: item.top,
        rotate: item.rotate,
        x,
        y,
      }}
    >
      <item.Icon size={item.size} strokeWidth={1.5} />
    </motion.div>
  );
}