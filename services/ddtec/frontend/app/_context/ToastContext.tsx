"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3.5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getToastColors = (type: ToastType) => {
        switch (type) {
            case "success":
                return {
                    border: "border-teal-500/20 dark:border-teal-500/30 border-l-[5px] border-l-teal-500 dark:border-l-teal-500",
                    glow: "shadow-teal-500/5 dark:shadow-teal-900/10",
                    iconContainer: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400",
                    titleColor: "text-teal-600 dark:text-teal-400",
                    barBg: "bg-teal-500",
                    header: "Action Successful"
                };
            case "error":
                return {
                    border: "border-rose-500/20 dark:border-rose-500/30 border-l-[5px] border-l-rose-500 dark:border-l-rose-500",
                    glow: "shadow-rose-500/5 dark:shadow-rose-900/10",
                    iconContainer: "bg-rose-50 dark:bg-rose-955/40 text-rose-600 dark:text-rose-400",
                    titleColor: "text-rose-600 dark:text-rose-400",
                    barBg: "bg-rose-500",
                    header: "System Alert"
                };
            case "warning":
                return {
                    border: "border-amber-500/20 dark:border-amber-500/30 border-l-[5px] border-l-amber-500 dark:border-l-amber-500",
                    glow: "shadow-amber-500/5 dark:shadow-amber-900/10",
                    iconContainer: "bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400",
                    titleColor: "text-amber-600 dark:text-amber-400",
                    barBg: "bg-amber-500",
                    header: "Warning Alert"
                };
            case "info":
            default:
                return {
                    border: "border-sky-500/20 dark:border-sky-500/30 border-l-[5px] border-l-sky-500 dark:border-l-sky-500",
                    glow: "shadow-sky-500/5 dark:shadow-sky-900/10",
                    iconContainer: "bg-sky-50 dark:bg-sky-955/40 text-sky-600 dark:text-sky-400",
                    titleColor: "text-sky-600 dark:text-sky-400",
                    barBg: "bg-sky-500",
                    header: "Broadcast Signal"
                };
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3.5 pointer-events-none md:max-w-sm w-full px-4 sm:px-0">
                <AnimatePresence>
                    {toasts.map((toast) => {
                        const style = getToastColors(toast.type);

                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, y: -20, scale: 0.9, x: 50 }}
                                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: 40, transition: { duration: 0.2 } }}
                                layout
                                className={`
                                    pointer-events-auto flex gap-3.5 w-full p-4.5 rounded-2xl shadow-xl border backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 text-slate-805 dark:text-slate-100 overflow-hidden relative transition-all group font-sans
                                    ${style.border} ${style.glow}
                                `}
                            >
                                {/* Left icon */}
                                <div className={`
                                    shrink-0 size-10 rounded-xl flex items-center justify-center shadow-xs transition-colors
                                    ${style.iconContainer}
                                `}>
                                    {toast.type === "success" && <CheckCircle className="size-5.5" />}
                                    {toast.type === "error" && <AlertCircle className="size-5.5" />}
                                    {toast.type === "info" && <Info className="size-5.5" />}
                                    {toast.type === "warning" && <AlertTriangle className="size-5.5" />}
                                </div>

                                {/* Text segments details */}
                                <div className="flex-1 text-left min-w-0 pr-1 select-none">
                                    <span className={`text-[10px] font-black uppercase tracking-wider block ${style.titleColor}`}>
                                        {style.header}
                                    </span>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 leading-relaxed break-words">
                                        {toast.message}
                                    </p>
                                </div>

                                {/* Dismiss button trigger */}
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="shrink-0 text-slate-400 hover:text-slate-655 dark:hover:text-slate-205 transition-colors p-1"
                                    title="Close alert"
                                >
                                    <X className="size-4" />
                                </button>

                                {/* Aesthetic bottom countdown progress timer bar */}
                                <motion.div
                                    initial={{ width: "100%" }}
                                    animate={{ width: "0%" }}
                                    transition={{ duration: 3.5, ease: "linear" }}
                                    className={`absolute bottom-0 left-0 h-[3px] opacity-80 ${style.barBg}`}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
