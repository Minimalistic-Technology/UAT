"use client";

import React, { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  dir?: "up" | "left" | "right" | "fade";
  className?: string;
}

export function Reveal({
  children,
  delay = 0,
  dir = "up",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const t: Record<string, string> = {
    up: "translateY(36px)",
    left: "translateX(-36px)",
    right: "translateX(36px)",
    fade: "scale(0.95)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : t[dir],
        transition: `opacity .65s ease ${delay}ms, transform .65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
