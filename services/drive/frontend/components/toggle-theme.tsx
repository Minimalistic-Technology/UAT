"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const ToggleTheme = () => {
  const { setTheme, resolvedTheme } = useTheme();
  return (
    <div className="absolute top-4 right-4 z-100">
      {resolvedTheme === "light" ? (
        <button onClick={() => setTheme("dark")} className="cursor-pointer">
          <Moon className="size-6 stroke-neutral-500" />
        </button>
      ) : (
        <button onClick={() => setTheme("light")} className="cursor-pointer">
          <Sun className="size-6 stroke-yellow-500" />
        </button>
      )}
    </div>
  );
};

export default ToggleTheme;
