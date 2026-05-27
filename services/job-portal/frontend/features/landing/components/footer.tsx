"use client"
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { IconBrandGithub, IconBrandTwitter, IconBrandLinkedin } from '@tabler/icons-react';
import Logo from "@/components/logo";

const FOOTER_COLS = [
  {
    title: "For candidates",
    links: ["Find jobs", "Browse companies", "Salary explorer", "Career stories", "Remote jobs"],
  },
  {
    title: "For employers",
    links: ["Post a job", "Source candidates", "Pricing", "Enterprise", "ATS integrations"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Privacy", "Terms"],
  },
];

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success

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
      <div className="max-w-[88rem] mx-auto px-6 md:px-12 py-20 md:py-28">
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
                className="relative group"
                data-testid="newsletter-form"
              >
                <div className="flex items-stretch bg-white border border-slate-200 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-50 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm">
                  <input
                    type="email"
                    required
                    disabled={status === "success"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@work.com"
                    className="flex-1 px-5 py-4 bg-transparent outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                    data-testid="newsletter-email-input"
                  />
                  <button
                    type="submit"
                    disabled={status !== "idle"}
                    className="px-6 bg-slate-950 hover:bg-indigo-600 disabled:bg-indigo-600 text-white font-bold transition-all flex items-center gap-2"
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
                </div>
                
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
                      <a
                        href={`/${link.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-slate-500 hover:text-indigo-600 font-medium text-sm transition-colors duration-200"
                        data-testid={`footer-link-${link.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {link}
                      </a>
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
            © {new Date().getFullYear()} Hireloop Technologies, Inc. Built with love for builders.
          </div>
          
          <div className="flex items-center gap-6 text-slate-400">
            {[
              { icon: IconBrandTwitter, label: "Twitter", href: "https://twitter.com" },
              { icon: IconBrandLinkedin, label: "LinkedIn", href: "https://linkedin.com" },
              { icon: IconBrandGithub, label: "Github", href: "https://github.com" }
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600 transition-colors p-2 hover:bg-slate-50 rounded-lg"
                aria-label={social.label}
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};