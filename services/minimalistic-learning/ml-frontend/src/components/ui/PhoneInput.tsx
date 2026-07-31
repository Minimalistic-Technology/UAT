import React, { useState, useEffect } from "react";
import { Input } from "./Input";

export const COUNTRIES = [
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
  { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "China", code: "+86", flag: "🇨🇳" },
  { name: "South Korea", code: "+82", flag: "🇰🇷" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
  { name: "New Zealand", code: "+64", flag: "🇳🇿" },
  { name: "Mexico", code: "+52", flag: "🇲🇽" },
  { name: "Russia", code: "+7", flag: "🇷🇺" },
  { name: "Indonesia", code: "+62", flag: "🇮🇩" },
  { name: "Turkey", code: "+90", flag: "🇹🇷" },
  { name: "Netherlands", code: "+31", flag: "🇳🇱" },
  { name: "Switzerland", code: "+41", flag: "🇨🇭" },
  { name: "Sweden", code: "+46", flag: "🇸🇪" },
  { name: "Norway", code: "+47", flag: "🇳🇴" },
  { name: "Denmark", code: "+45", flag: "🇩🇰" },
  { name: "Malaysia", code: "+60", flag: "🇲🇾" },
  { name: "Philippines", code: "+63", flag: "🇵🇭" },
  { name: "Thailand", code: "+66", flag: "🇹🇭" },
  { name: "Vietnam", code: "+84", flag: "🇻🇳" },
  { name: "Pakistan", code: "+92", flag: "🇵🇰" },
  { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
  { name: "Sri Lanka", code: "+94", flag: "🇱🇰" },
  { name: "Nepal", code: "+977", flag: "🇳🇵" },
  { name: "Egypt", code: "+20", flag: "🇪🇬" },
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "Argentina", code: "+54", flag: "🇦🇷" },
  { name: "Colombia", code: "+57", flag: "🇨🇴" },
];

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value = "",
  onChange,
  error,
}) => {
  const [code, setCode] = useState("+91");
  const [num, setNum] = useState("");

  useEffect(() => {
    if (value) {
      // Find matching country code from value
      const found = COUNTRIES.sort(
        (a, b) => b.code.length - a.code.length,
      ).find((c) => value.startsWith(c.code));
      if (found) {
        setCode(found.code);
        setNum(value.slice(found.code.length).replace(/\D/g, ""));
      } else {
        // If not found, safely fallback
        setNum(value.replace(/\D/g, ""));
      }
    } else {
      setNum("");
    }
  }, [value]);

  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setNum(raw);
    if (onChange) onChange(`${code}${raw}`);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onChange) onChange(`${newCode}${num}`);
  };

  return (
    <div className="group flex w-full">
      <select
        value={code}
        onChange={handleCodeChange}
        className={`bg-theme-element-sec/50 border-y border-l px-2 py-3.5 sm:px-3 ${error ? "border-red-500" : "border-theme-accent/20 group-hover:border-theme-accent/40"} text-foreground custom-scrollbar z-10 w-[70px] cursor-pointer appearance-none rounded-l-xl font-bold transition-colors focus:outline-none sm:w-[90px]`}
        style={{ scrollbarWidth: "thin" }}
      >
        {COUNTRIES.map((c) => (
          <option
            key={c.name}
            value={c.code}
            className="bg-theme-element text-foreground"
          >
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <div className="relative w-full">
        <Input
          value={num}
          onChange={handleNumChange}
          type="tel"
          placeholder="Phone Number"
          error={error}
          className="relative -ml-0.5 w-[calc(100%+2px)] rounded-l-none pl-3 focus:z-20"
        />
      </div>
    </div>
  );
};
