"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Logo from "@/components/logo";
import { FOOTER_COLS, SocialLinks } from "../config";
import { APP_NAME } from "@/constants";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle"); // idle | loading | success

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 5000);
  };

  return (
    <footer
      className="border-t border-slate-200 bg-white"
      data-testid="site-footer"
    >
      <div className="mx-auto max-w-352 px-6 py-20 md:px-12 md:py-28">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-5">
            <Logo />

            <p className="mt-6 max-w-sm text-lg leading-relaxed text-slate-500">
              The career platform for people who care about the work. Join
              120,000+ professionals finding roles they actually want.
            </p>

            {/* Newsletter Container */}
            <div className="mt-10 max-w-md">
              <h4 className="mb-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                Weekly handpicked jobs
              </h4>
              <form
                onSubmit={handleSubmit}
                className="relative mt-4 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:gap-0"
                data-testid="newsletter-form"
              >
                <input
                  type="email"
                  required
                  disabled={status === "success"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@work.com"
                  className="focus:border-primary focus:ring-primary/10 relative z-10 w-full flex-1 rounded-xl border border-slate-200 bg-white px-5 py-4 font-medium text-slate-900 shadow-sm transition-all outline-none placeholder:text-slate-400 hover:z-20 focus:z-20 focus:ring-4 sm:rounded-l-2xl sm:rounded-r-none sm:border-r-0 sm:shadow-none"
                  data-testid="newsletter-email-input"
                />
                <button
                  type="submit"
                  disabled={status !== "idle"}
                  className="hover:bg-primary disabled:bg-primary relative flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-4 font-bold text-white shadow-sm transition-all sm:w-auto sm:rounded-l-none sm:rounded-r-2xl sm:py-0"
                  data-testid="newsletter-submit-btn"
                >
                  {status === "loading" ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : status === "success" ? (
                    "Joined"
                  ) : (
                    <>
                      Subscribe <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {status === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute -bottom-8 left-0 flex items-center gap-2 text-sm font-bold text-emerald-600"
                    >
                      <CheckCircle2 size={16} /> Check your inbox every Monday
                      morning.
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>

          {/* Navigation Columns */}
          <nav className="grid grid-cols-2 gap-10 md:grid-cols-3 md:gap-8 lg:col-span-7">
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-900 uppercase">
                  {col.title}
                </h3>
                <ul className="mt-6 space-y-4">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href={`/${link.toLowerCase().replace(/\s+/g, "-")}`}
                        className="hover:text-primary text-sm font-medium text-slate-500 transition-colors duration-200"
                        data-testid={`footer-link-${link.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 flex flex-col items-center justify-between gap-8 border-t border-slate-100 pt-10 md:flex-row">
          <div className="text-sm font-medium text-slate-400">
            © {new Date().getFullYear()} {APP_NAME}. Built with love for
            builders.
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            {SocialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary rounded-lg p-2 transition-colors hover:bg-slate-50"
                aria-label={social.label}
              >
                <social.icon size={20} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
