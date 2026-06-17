import * as React from "react";
import { cn } from "@/lib/utils";

export interface CountryCodeSelectorProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  // Additional props can be added here
}

// A comprehensive generic list of country codes
export const countryCodes = [
  { code: "+1", flag: "🇺🇸", country: "United States/Canada" },
  { code: "+7", flag: "🇷🇺", country: "Russia/Kazakhstan" },
  { code: "+20", flag: "🇪🇬", country: "Egypt" },
  { code: "+27", flag: "🇿🇦", country: "South Africa" },
  { code: "+33", flag: "🇫🇷", country: "France" },
  { code: "+34", flag: "🇪🇸", country: "Spain" },
  { code: "+39", flag: "🇮🇹", country: "Italy" },
  { code: "+44", flag: "🇬🇧", country: "United Kingdom" },
  { code: "+49", flag: "🇩🇪", country: "Germany" },
  { code: "+52", flag: "🇲🇽", country: "Mexico" },
  { code: "+55", flag: "🇧🇷", country: "Brazil" },
  { code: "+60", flag: "🇲🇾", country: "Malaysia" },
  { code: "+61", flag: "🇦🇺", country: "Australia" },
  { code: "+64", flag: "🇳🇿", country: "New Zealand" },
  { code: "+65", flag: "🇸🇬", country: "Singapore" },
  { code: "+81", flag: "🇯🇵", country: "Japan" },
  { code: "+82", flag: "🇰🇷", country: "South Korea" },
  { code: "+86", flag: "🇨🇳", country: "China" },
  { code: "+91", flag: "🇮🇳", country: "India" },
  { code: "+92", flag: "🇵🇰", country: "Pakistan" },
  { code: "+94", flag: "🇱🇰", country: "Sri Lanka" },
  { code: "+98", flag: "🇮🇷", country: "Iran" },
  { code: "+254", flag: "🇰🇪", country: "Kenya" },
  { code: "+353", flag: "🇮🇪", country: "Ireland" },
  { code: "+358", flag: "🇫🇮", country: "Finland" },
  { code: "+880", flag: "🇧🇩", country: "Bangladesh" },
  { code: "+971", flag: "🇦🇪", country: "UAE" },
  { code: "+972", flag: "🇮🇱", country: "Israel" },
  { code: "+977", flag: "🇳🇵", country: "Nepal" },
];

const CountryCodeSelector = React.forwardRef<
  HTMLSelectElement,
  CountryCodeSelectorProps
>(({ className, ...props }, ref) => {
  return (
    <select
      className={cn(
        "h-full w-[70px] cursor-pointer appearance-none rounded-l-lg border border-r-0 border-slate-200 bg-slate-100 px-2 text-xs font-medium text-slate-600 focus:ring-1 focus:ring-blue-500 focus-visible:outline-none lg:w-[85px] lg:px-3 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
        className,
      )}
      ref={ref}
      {...props}
    >
      {countryCodes.map((c) => (
        <option key={`${c.country}-${c.code}`} value={c.code}>
          {c.flag} {c.code}
        </option>
      ))}
    </select>
  );
});
CountryCodeSelector.displayName = "CountryCodeSelector";

export { CountryCodeSelector };
