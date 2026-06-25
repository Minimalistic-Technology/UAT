import React from 'react';
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

export const ModernSwitch = ({ checked, onChange, loading, colorClass }: { checked: boolean; onChange: () => void; loading: boolean; colorClass: string }) => (
    <Button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={loading}
        className={`relative inline-flex h-8 w-[60px] shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${checked ? colorClass : 'bg-theme-element-sec border border-theme-accent/20'}`}
    >
        <span className="sr-only">Toggle setting</span>
        <span
            className={`pointer-events-none absolute left-0.5 inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out flex items-center justify-center ${checked ? 'translate-x-[30px]' : 'translate-x-0'}`}
        >
            {loading ? <Loader2 size={12} className="animate-spin text-theme-action" /> : null}
        </span>
    </Button>
);
