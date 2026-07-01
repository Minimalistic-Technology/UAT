"use client";

import React, { useRef } from "react";

interface TiltProps {
  children: React.ReactNode;
  className?: string;
  rotationFactor?: number;
  scale?: number;
  perspective?: number;
  translateZ?: number;
}

export function Tilt({
  children,
  className = "",
  rotationFactor = 12,
  scale = 1.04,
  perspective = 700,
  translateZ = 0,
}: TiltProps) {
  const el = useRef<HTMLDivElement>(null);

  const move = (e: React.MouseEvent) => {
    if (!el.current) return;
    const { left, top, width, height } = el.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    el.current.style.transform = `perspective(${perspective}px) rotateY(${x * rotationFactor}deg) rotateX(${-y * rotationFactor}deg) scale3d(${scale},${scale},${scale}) translateZ(${translateZ}px)`;
  };

  const leave = () => {
    if (el.current) {
      el.current.style.transform = `perspective(${perspective}px) rotateY(0) rotateX(0) scale3d(1,1,1) translateZ(0)`;
    }
  };

  return (
    <div
      ref={el}
      onMouseMove={move}
      onMouseLeave={leave}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
