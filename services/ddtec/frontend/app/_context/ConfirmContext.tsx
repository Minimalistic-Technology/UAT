"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldQuestion, Trash2 } from "lucide-react";

type ConfirmVariant = "default" | "danger";

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmVariant;
}

interface PendingConfirm extends Required<Omit<ConfirmOptions, "title">> {
    title: string;
    resolve: (value: boolean) => void;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [pending, setPending] = useState<PendingConfirm | null>(null);

    const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
        const opts: ConfirmOptions = typeof options === "string" ? { message: options } : options;
        return new Promise<boolean>((resolve) => {
            setPending({
                title: opts.title || (opts.variant === "danger" ? "Confirm Deletion" : "Please Confirm"),
                message: opts.message,
                confirmLabel: opts.confirmLabel || (opts.variant === "danger" ? "Delete" : "Confirm"),
                cancelLabel: opts.cancelLabel || "Cancel",
                variant: opts.variant || "default",
                resolve,
            });
        });
    }, []);

    const handleClose = (result: boolean) => {
        pending?.resolve(result);
        setPending(null);
    };

    const isDanger = pending?.variant === "danger";

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <AnimatePresence>
                {pending && (
                    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => handleClose(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            role="alertdialog"
                            aria-modal="true"
                            className="relative bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 flex flex-col items-center text-center gap-4">
                                <div
                                    className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                        isDanger
                                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                                            : "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400"
                                    }`}
                                >
                                    {isDanger ? <Trash2 className="size-6" /> : <ShieldQuestion className="size-6" />}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        {pending.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                        {pending.message}
                                    </p>
                                </div>
                            </div>
                            <div className="px-6 pb-6 flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleClose(false)}
                                    className="flex-1 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                    {pending.cancelLabel}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleClose(true)}
                                    className={`flex-1 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition-colors cursor-pointer ${
                                        isDanger
                                            ? "bg-rose-600 hover:bg-rose-700"
                                            : "bg-teal-600 hover:bg-teal-700"
                                    }`}
                                >
                                    {pending.confirmLabel}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (context === undefined) {
        throw new Error("useConfirm must be used within a ConfirmProvider");
    }
    return context.confirm;
};
