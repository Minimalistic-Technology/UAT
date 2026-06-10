"use client"
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
    await new Promise(resolve => setTimeout(resolve, 800));

    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 5000);
  };

  return (
    <footer
      className="bg-white border-t border-slate-200"
      data-testid="site-footer"
    >
      <div className="max-w-352 mx-auto px-6 md:px-12 py-20 md:py-28">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-12">
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-5">
            <Logo />

            <p className="mt-6 text-slate-500 max-w-sm leading-relaxed text-lg">
              The career platform for people who care about the work. Join
              120,000+ professionals finding roles they actually want.
            </p>

            {/* Newsletter Container */}
            <div className="mt-10 max-w-md">
              <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mb-4">
                Weekly handpicked jobs
              </h4>
              <form
                onSubmit={handleSubmit}
                className="relative flex flex-col sm:flex-row items-stretch gap-3 sm:gap-0 w-full mt-4"
                data-testid="newsletter-form"
              >
                <input
                  type="email"
                  required
                  disabled={status === "success"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@work.com"
                  className="flex-1 w-full px-5 py-4 bg-white border border-slate-200 sm:border-r-0 focus:border-primary focus:ring-4 focus:ring-primary/10 sm:rounded-l-2xl sm:rounded-r-none rounded-xl outline-none text-slate-900 placeholder:text-slate-400 font-medium transition-all shadow-sm sm:shadow-none z-10 hover:z-20 focus:z-20 relative"
                  data-testid="newsletter-email-input"
                />
                <button
                  type="submit"
                  disabled={status !== "idle"}
                  className="w-full sm:w-auto px-6 py-4 sm:py-0 shrink-0 bg-slate-950 hover:bg-primary disabled:bg-primary text-white font-bold transition-all flex items-center justify-center gap-2 sm:rounded-r-2xl sm:rounded-l-none rounded-xl relative shadow-sm"
                  data-testid="newsletter-submit-btn"
                >
                  {status === "loading" ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : status === "success" ? (
                    "Joined"
                  ) : (
                    <>Subscribe <ArrowRight size={18} /></>
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
                      <CheckCircle2 size={16} /> Check your inbox every Monday morning.
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>

          {/* Navigation Columns */}
          <nav className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-8">
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-900">
                  {col.title}
                </h3>
                <ul className="mt-6 space-y-4">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href={`/${link.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-slate-500 hover:text-primary font-medium text-sm transition-colors duration-200"
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
        <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-sm font-medium text-slate-400">
            © {new Date().getFullYear()} {APP_NAME}. Built with love for builders.
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            {SocialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 hover:bg-slate-50 rounded-lg"
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