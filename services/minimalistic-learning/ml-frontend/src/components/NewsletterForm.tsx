"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || status === "loading") return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus("error");
            setMsg("Please enter a valid email address.");
            return;
        }

        setStatus("loading");
        try {
            await api.post("/public/subscribe", { email: email.trim() });
            setStatus("success");
            setMsg("You're subscribed! Check your inbox 📬");
            setEmail("");
        } catch (err: any) {
            setStatus("error");
            setMsg(err?.response?.data?.message || "Subscription failed. Please try again.");
        }
    };

    if (status === "success") {
        return (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 w-full">
                <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-emerald-700 dark:text-emerald-300 text-sm font-bold">{msg}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="flex items-center w-full bg-background border border-theme-accent/20 rounded-lg overflow-hidden focus-within:border-theme-action focus-within:shadow-[0_0_10px_var(--color-theme-action)] transition-all">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                    }}
                    placeholder="Email..."
                    className="w-full bg-transparent border-none outline-none px-4 py-2.5 text-foreground text-[13px] min-w-0 placeholder:text-foreground/40"
                />
                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="bg-theme-action hover:brightness-110 px-4 py-2.5 text-white transition-all flex items-center justify-center disabled:opacity-60"
                >
                    {status === "loading"
                        ? <Loader2 size={16} className="animate-spin" />
                        : <ArrowRight size={16} />}
                </button>
            </div>
            {status === "error" && (
                <p className="text-red-600 dark:text-red-400 text-[11px] font-bold mt-2">{msg}</p>
            )}
        </form>
    );
}
