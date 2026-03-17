'use client';

import React, { useEffect, useRef } from 'react';
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
}

const Fireworks: React.FC<FireworksProps> = ({ 
  className = '', 
  options = { opacity: 0.85 } 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<FireworksInstance | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initializeFireworks = () => {
      const fireworks = (window as FireworksWindow).Fireworks;
      if (!fireworks || !fireworks.createFireworks) {
        console.warn('Fireworks library not loaded');
        return;
      }

      // Create fireworks instance
      instanceRef.current = fireworks.createFireworks(containerRef.current!, options);
    };

    // Small delay to ensure script is loaded
    const timer = setTimeout(initializeFireworks, 100);

    return () => {
      clearTimeout(timer);
      if (instanceRef.current?.destroy) {
        instanceRef.current.destroy();
      }
    };
  }, [options]);

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