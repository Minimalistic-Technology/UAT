"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const COOKIE_CONSENT_KEY = "ddtec_cookie_consent";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check existing consent choice in localStorage
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    }

    // Optional event listener if user wants to change cookie settings later
    const handleReopen = () => setIsVisible(true);
    window.addEventListener("ddtec:open-cookie-banner", handleReopen);
    return () => {
      window.removeEventListener("ddtec:open-cookie-banner", handleReopen);
    };
  }, []);

  const handleConsent = (choice: "accepted" | "essential") => {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[9990] pointer-events-auto"
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-description"
        >
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl shadow-slate-900/10 dark:shadow-black/40">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl shrink-0">
                <Cookie className="size-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    id="cookie-banner-title"
                    className="text-sm font-semibold text-slate-900 dark:text-slate-100"
                  >
                    Cookie Notice
                  </h3>
                  <button
                    onClick={() => handleConsent("essential")}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg"
                    title="Dismiss"
                    aria-label="Dismiss cookie notice"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <p
                  id="cookie-banner-description"
                  className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
                >
                  We use cookies and local storage to personalize content, remember your preferences, and analyze our traffic. See our{" "}
                  <Link
                    href="/cookie-policy"
                    className="text-teal-600 dark:text-teal-400 font-medium hover:underline inline-block"
                  >
                    Cookie Policy
                  </Link>{" "}
                  for details.
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleConsent("accepted")}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium text-xs py-2 px-3.5 rounded-lg transition-colors shadow-xs"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={() => handleConsent("essential")}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium text-xs py-2 px-3.5 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700/60"
                  >
                    Necessary Only
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
