'use client';

import React from 'react';

const ComingSoon: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">Coming Soon</h1>
        <p className="text-xl text-gray-600 mb-8">We're working hard to bring you something amazing. Stay tuned!</p>
        <div className="text-4xl">🚀</div>
      </div>
    </div>
  );
};

export default ComingSoon;