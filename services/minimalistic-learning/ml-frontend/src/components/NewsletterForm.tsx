"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
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
      setMsg(
        err?.response?.data?.message ||
          "Subscription failed. Please try again.",
      );
    }
  };

  if (status === "success") {
    return (
      <div className="flex w-full items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
        <CheckCircle
          size={18}
          className="shrink-0 text-emerald-600 dark:text-emerald-400"
        />
        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
          {msg}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="bg-background border-theme-accent/20 focus-within:border-theme-action flex w-full items-center overflow-hidden rounded-lg border transition-all focus-within:shadow-[0_0_10px_var(--color-theme-action)]">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="Email..."
          className="text-foreground placeholder:text-foreground/40 w-full min-w-0 border-none bg-transparent px-4 py-2.5 text-[13px] outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-theme-action flex items-center justify-center px-4 py-2.5 text-white transition-all hover:brightness-110 disabled:opacity-60"
        >
          {status === "loading" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ArrowRight size={16} />
          )}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-[11px] font-bold text-red-600 dark:text-red-400">
          {msg}
        </p>
      )}
    </form>
  );
}
