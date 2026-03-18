'use client';

import React, { useState, useEffect } from 'react';

const ComingSoon: React.FC = () => {
  const releaseDate = new Date("2026-03-18T23:59:00");
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = releaseDate.getTime() - now;
      setTimeRemaining(distance > 0 ? distance : 0);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const { days, hours, minutes, seconds } = formatTime(timeRemaining);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">Coming Soon</h1>
        <p className="text-xl text-gray-600 mb-8">We're working hard to bring you something amazing. Stay tuned!</p>
        <div className="text-4xl mb-8">🚀</div>
        <div className="text-2xl font-semibold text-gray-700">
          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">{days}</div>
              <div className="text-sm">Days</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">{hours}</div>
              <div className="text-sm">Hours</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">{minutes}</div>
              <div className="text-sm">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">{seconds}</div>
              <div className="text-sm">Seconds</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;