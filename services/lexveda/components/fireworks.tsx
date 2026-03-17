'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface FireworksOptions {
  opacity?: number;
  width?: number;
  height?: number;
  [key: string]: any;
}

interface FireworksInstance {
  destroy: () => void;
  [key: string]: any;
}

interface FireworksWindow extends Window {
  Fireworks?: {
    createFireworks: (element: HTMLElement, options: FireworksOptions) => FireworksInstance;
  };
}

interface FireworksProps {
  className?: string;
  options?: FireworksOptions;
  durationMinutes?: number;
}

// Constant for fireworks start time storage key
const FIREWORKS_START_TIME_KEY = 'fireworks_start_time';
const FIREWORKS_DURATION_MINUTES = 15;

const Fireworks: React.FC<FireworksProps> = ({ 
  className = '', 
  options = { opacity: 0.85 },
  durationMinutes = FIREWORKS_DURATION_MINUTES
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<FireworksInstance | null>(null);
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if fireworks session is still active
  const isFireworksSessionActive = (): boolean => {
    if (typeof window === 'undefined') return false;

    const startTimeStr = localStorage.getItem(FIREWORKS_START_TIME_KEY);
    
    if (!startTimeStr) {
      // First time - set start time now
      const now = Date.now();
      localStorage.setItem(FIREWORKS_START_TIME_KEY, now.toString());
      return true;
    }

    const startTime = parseInt(startTimeStr, 10);
    const elapsedMinutes = (Date.now() - startTime) / (1000 * 60);

    return elapsedMinutes < durationMinutes;
  };

  // Calculate remaining time until fireworks should stop
  const getRemainingTime = (): number => {
    if (typeof window === 'undefined') return 0;

    const startTimeStr = localStorage.getItem(FIREWORKS_START_TIME_KEY);
    if (!startTimeStr) return durationMinutes * 60 * 1000;

    const startTime = parseInt(startTimeStr, 10);
    const elapsedTime = Date.now() - startTime;
    const totalDuration = durationMinutes * 60 * 1000;
    
    return Math.max(0, totalDuration - elapsedTime);
  };

  useEffect(() => {
    // Check if session is active
    if (!isFireworksSessionActive()) {
      setIsActive(false);
      return;
    }

    setIsActive(true);

    const initializeFireworks = () => {
      if (!containerRef.current) return;

      const fireworks = (window as FireworksWindow).Fireworks;
      if (!fireworks || !fireworks.createFireworks) {
        console.warn('Fireworks library not loaded');
        return;
      }

      // Create fireworks instance
      instanceRef.current = fireworks.createFireworks(containerRef.current!, options);
    };

    // Small delay to ensure script is loaded
    const setupTimer = setTimeout(initializeFireworks, 100);

    // Set up timer to stop fireworks after duration
    const remainingTime = getRemainingTime();
    timerRef.current = setTimeout(() => {
      setIsActive(false);
      if (instanceRef.current?.destroy) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    }, remainingTime);

    return () => {
      clearTimeout(setupTimer);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [options, durationMinutes]);

  if (!isActive) {
    return null;
  }

  return (
    <>
      <Script 
        src="/fireworks/fireworks.core.js" 
        strategy="afterInteractive"
      />
      <div 
        ref={containerRef} 
        className={`relative w-full h-full ${className}`}
        style={{ overflow: 'hidden' }}
      />
    </>
  );
};

export default Fireworks;