// Shared definitions for the customizable "highlight" boxes shown on a product's
// Overview & Highlights tab (e.g. "Original Guarantee", "Express Shipping"). Used by
// both the admin product form (to build/edit the list + icon picker) and the public
// product page (to render it). Centralized so the icon map and color classes stay in
// sync between the two, and so Tailwind sees every class name as a static string.

import {
    ShieldCheck,
    Truck,
    Clock,
    Download,
    Ban,
    Star,
    Heart,
    PackageCheck,
    RefreshCw,
    CheckCircle2,
    Sparkles,
    Tag,
    Calendar,
    Info,
    Layers,
    TrendingUp,
    MessageCircle,
    Gift,
    Zap,
    Lock,
    Award,
    ThumbsUp,
    Headphones,
    type LucideIcon,
} from "lucide-react";

export interface ProductHighlight {
    icon: string;
    title: string;
    description: string;
    color: string;
}

export const HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
    ShieldCheck,
    Truck,
    Clock,
    Download,
    Ban,
    Star,
    Heart,
    PackageCheck,
    RefreshCw,
    CheckCircle2,
    Sparkles,
    Tag,
    Calendar,
    Info,
    Layers,
    TrendingUp,
    MessageCircle,
    Gift,
    Zap,
    Lock,
    Award,
    ThumbsUp,
    Headphones,
};

export const HIGHLIGHT_ICON_NAMES = Object.keys(HIGHLIGHT_ICONS);

export const DEFAULT_HIGHLIGHT_ICON = "ShieldCheck";

export function getHighlightIcon(name?: string): LucideIcon {
    return (name && HIGHLIGHT_ICONS[name]) || HIGHLIGHT_ICONS[DEFAULT_HIGHLIGHT_ICON];
}

export const HIGHLIGHT_COLORS: Record<string, { card: string; iconBg: string; label: string }> = {
    teal: {
        label: "Teal",
        card: "bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50",
        iconBg: "bg-teal-600",
    },
    blue: {
        label: "Blue",
        card: "bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50",
        iconBg: "bg-blue-600",
    },
    amber: {
        label: "Amber",
        card: "bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50",
        iconBg: "bg-amber-600",
    },
    violet: {
        label: "Violet",
        card: "bg-violet-50/50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50",
        iconBg: "bg-violet-600",
    },
    rose: {
        label: "Rose",
        card: "bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50",
        iconBg: "bg-rose-600",
    },
    emerald: {
        label: "Emerald",
        card: "bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50",
        iconBg: "bg-emerald-600",
    },
    purple: {
        label: "Purple",
        card: "bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50",
        iconBg: "bg-purple-600",
    },
    slate: {
        label: "Slate",
        card: "bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50",
        iconBg: "bg-slate-600",
    },
};

export const HIGHLIGHT_COLOR_NAMES = Object.keys(HIGHLIGHT_COLORS);

export const DEFAULT_HIGHLIGHT_COLOR = "teal";

export function getHighlightColorClasses(color?: string) {
    return HIGHLIGHT_COLORS[color || ""] || HIGHLIGHT_COLORS[DEFAULT_HIGHLIGHT_COLOR];
}

export const DEFAULT_HIGHLIGHTS: ProductHighlight[] = [
    {
        icon: "ShieldCheck",
        title: "Original Guarantee",
        description: "100% genuine product sourced directly from brand manufacturer.",
        color: "teal",
    },
    {
        icon: "Truck",
        title: "Express Shipping",
        description: "Fast doorstep delivery within 3-5 business days.",
        color: "blue",
    },
    {
        icon: "Clock",
        title: "Real-time Stock",
        description: "Inventory and price updated live in real time.",
        color: "amber",
    },
];

export function makeEmptyHighlight(): ProductHighlight {
    return { icon: DEFAULT_HIGHLIGHT_ICON, title: "", description: "", color: DEFAULT_HIGHLIGHT_COLOR };
}
