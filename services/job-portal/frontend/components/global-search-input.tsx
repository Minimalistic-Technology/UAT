"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GlobalSearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    className?: string;
}

export function GlobalSearchInput({
    value,
    onChange,
    placeholder = "Search...",
    debounceMs = 500,
    className = "w-full",
}: GlobalSearchInputProps) {
    const [localValue, setLocalValue] = useState(value);

    // Sync external value when it changes
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
            }
        }, debounceMs);

        return () => {
            clearTimeout(handler);
        };
    }, [localValue, onChange, debounceMs, value]);

    const handleClear = () => {
        setLocalValue("");
        onChange("");
    };

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
                placeholder={placeholder}
                className="pl-9 pr-9 h-10 rounded-xl w-full"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
            />
            {localValue && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
