"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Check } from "lucide-react";

interface CreatableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    storageKey?: string;
    placeholder?: string;
    className?: string;
}

// Dropdown that behaves like a native <select> but lets the user type to filter
// and add a brand-new option on the fly. Custom options the user creates are
// persisted to localStorage (per storageKey) so they show up again next time.
export default function CreatableSelect({
    value,
    onChange,
    options,
    storageKey,
    placeholder = "Select...",
    className = "",
}: CreatableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [customOptions, setCustomOptions] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!storageKey) return;
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) setCustomOptions(JSON.parse(stored));
        } catch {
            // ignore malformed storage
        }
    }, [storageKey]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const allOptions = Array.from(new Set([...options, ...customOptions]));
    const filtered = allOptions.filter(o => o.toLowerCase().includes(search.trim().toLowerCase()));
    const trimmedSearch = search.trim();
    const exactMatch = allOptions.some(o => o.toLowerCase() === trimmedSearch.toLowerCase());
    const canCreate = trimmedSearch.length > 0 && !exactMatch;

    const selectOption = (option: string) => {
        onChange(option);
        setIsOpen(false);
        setSearch("");
    };

    const createOption = () => {
        if (!canCreate) return;
        const next = [...customOptions, trimmedSearch];
        setCustomOptions(next);
        if (storageKey) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(next));
            } catch {
                // ignore storage write failures (e.g. private browsing)
            }
        }
        selectOption(trimmedSearch);
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none flex items-center justify-between gap-2 text-left cursor-pointer"
            >
                <span className={value ? "" : "text-slate-400"}>{value || placeholder}</span>
                <ChevronDown className={`size-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (filtered.length === 1) {
                                        selectOption(filtered[0]);
                                    } else if (canCreate) {
                                        createOption();
                                    }
                                }
                            }}
                            placeholder="Search or create new..."
                            className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    <ul className="max-h-48 overflow-y-auto scrollbar-hide py-1">
                        {filtered.map(option => (
                            <li key={option}>
                                <button
                                    type="button"
                                    onClick={() => selectOption(option)}
                                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                                >
                                    <span className="truncate">{option}</span>
                                    {option === value && <Check className="size-4 text-teal-600 shrink-0" />}
                                </button>
                            </li>
                        ))}
                        {filtered.length === 0 && !canCreate && (
                            <li className="px-3 py-2 text-sm text-slate-400">No matches</li>
                        )}
                    </ul>

                    {canCreate && (
                        <button
                            type="button"
                            onClick={createOption}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-teal-600 dark:text-teal-400 border-t border-slate-100 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer"
                        >
                            <Plus className="size-4 shrink-0" />
                            <span className="truncate">Create &quot;{trimmedSearch}&quot;</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
