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
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 w-full">
                <CheckCircle size={18} className="text-green-400 shrink-0" />
                <p className="text-green-300 text-sm font-bold">{msg}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="flex items-center w-full bg-gray-900 border border-gray-800 rounded-lg overflow-hidden focus-within:border-[#1877F2] focus-within:shadow-[0_0_10px_rgba(24,119,242,0.1)] transition-all">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                    }}
                    placeholder="Email..."
                    className="w-full bg-transparent border-none outline-none px-4 py-2.5 text-white text-[13px] min-w-0 placeholder:text-gray-600"
                />
                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="bg-[#1877F2] hover:bg-blue-600 px-4 py-2.5 text-white transition-colors flex items-center justify-center disabled:opacity-60"
                >
                    {status === "loading"
                        ? <Loader2 size={16} className="animate-spin" />
                        : <ArrowRight size={16} />}
                </button>
            </div>
            {status === "error" && (
                <p className="text-red-400 text-[11px] font-bold mt-2">{msg}</p>
            )}
        </form>
    );
}
