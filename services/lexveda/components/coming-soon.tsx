'use client';

import React, { useState, useEffect, useMemo } from 'react';

const RELEASE_DATE = new Date("2026-03-19T14:28:00").getTime();

const ComingSoon: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = RELEASE_DATE - now;
      setTimeRemaining(distance > 0 ? distance : 0);
    };

    updateTimer(); // Initial call
    const timer = setInterval(updateTimer, 1000);
    
    return () => clearInterval(timer);
  }, []); // Empty dependency array is now safe

  const formatTime = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    const pad = (num: number) => num.toString().padStart(2, '0');

    return { 
      days: pad(days), 
      hours: pad(hours), 
      minutes: pad(minutes), 
      seconds: pad(seconds) 
    };
  };

  const { days, hours, minutes, seconds } = formatTime(timeRemaining);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-sans font-bold text-gray-800 mb-4">Coming Soon</h1>
        <p className="text-xl font-sans text-gray-600 mb-8">We're working hard to bring you something amazing.</p>
        
        <div className="flex items-center justify-center space-x-2 md:space-x-4 text-gray-700">
          <TimeUnit value={days} label="Days" />
          <Separator />
          <TimeUnit value={hours} label="Hours" />
          <Separator />
          <TimeUnit value={minutes} label="Minutes" />
          <Separator />
          <TimeUnit value={seconds} label="Seconds" />
        </div>
      </div>
    </div>
  );
};

// Sub-components to keep the JSX clean
const TimeUnit = ({ value, label }: { value: string, label: string }) => (
  <div className="text-center">
    <div className="text-3xl md:text-5xl font-sans font-bold text-black w-16 md:w-20">{value}</div>
    <div className="text-xs md:text-sm uppercase tracking-wide text-gray-500">{label}</div>
  </div>
);

const Separator = () => (
  <div className="text-3xl md:text-5xl font-bold pb-6 text-gray-400">:</div>
);

export default ComingSoon;