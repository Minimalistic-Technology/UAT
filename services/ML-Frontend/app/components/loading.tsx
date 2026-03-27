"use client";
import React from "react";

const LoadingSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-[#FFCCBC]/30 rounded-3xl h-72 shadow-md"
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
