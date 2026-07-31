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
    return <div className="h-8 w-[68px]" />;
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-[34px] w-[68px] items-center overflow-hidden rounded-full border border-gray-300 bg-gray-200 p-1 shadow-inner transition-colors duration-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute flex h-[26px] w-[26px] transform items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.15)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] dark:bg-gray-950 dark:shadow-[0_2px_10px_rgba(0,0,0,0.5)] ${
          isDark ? "translate-x-[34px]" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon size={14} className="text-[#1877F2]" />
        ) : (
          <Sun size={14} className="text-[#f59e0b]" />
        )}
      </div>
      <div className="z-0 flex w-full justify-between px-1 text-gray-400 dark:text-gray-500/80">
        <Sun
          size={14}
          className={isDark ? "ml-[2px] opacity-100" : "opacity-0"}
        />
        <Moon
          size={14}
          className={isDark ? "opacity-0" : "mr-[2px] opacity-100"}
        />
      </div>
    </button>
  );
}
