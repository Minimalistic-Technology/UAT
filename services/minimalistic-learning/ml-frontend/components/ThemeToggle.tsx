"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[68px] h-8" />;
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-[68px] h-[34px] flex items-center bg-gray-200 dark:bg-gray-800 rounded-full p-1 transition-colors duration-500 focus:outline-none shadow-inner border border-gray-300 dark:border-gray-700 overflow-hidden"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute w-[26px] h-[26px] rounded-full bg-white dark:bg-gray-950 shadow-[0_2px_10px_rgba(0,0,0,0.15)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.5)] transform transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center ${isDark ? 'translate-x-[34px]' : 'translate-x-0'
          }`}
      >
        {isDark ? (
          <Moon size={14} className="text-[#1877F2]" />
        ) : (
          <Sun size={14} className="text-[#f59e0b]" />
        )}
      </div>
      <div className="w-full flex justify-between px-1 z-0 text-gray-400 dark:text-gray-500/80">
        <Sun size={14} className={isDark ? 'opacity-100 ml-[2px]' : 'opacity-0'} />
        <Moon size={14} className={isDark ? 'opacity-0' : 'opacity-100 mr-[2px]'} />
      </div>
    </button>
  );
}
