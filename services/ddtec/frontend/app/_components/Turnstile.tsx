"use client";

import React, { useEffect, useRef } from "react";

interface TurnstileProps {
  sitekey?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: string;
          "response-field-name"?: string;
          action?: string;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

// Official Cloudflare Turnstile Testing Sitekey (Always Passes)
const DEMO_SITEKEY = "1x00000000000000000000AA";

export default function Turnstile({
  sitekey,
  onVerify,
  onExpire,
  onError,
  theme = "auto",
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Keep latest callbacks in refs to avoid re-rendering/destroying Turnstile on state updates
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  }, [onVerify, onExpire, onError]);

  const envKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
  const isPlaceholderKey =
    !envKey || envKey.includes("placeholder") || envKey.trim() === "";

  const effectiveSitekey =
    sitekey || (isPlaceholderKey ? DEMO_SITEKEY : envKey);

  useEffect(() => {
    let isMounted = true;

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile || !isMounted) return;

      // Prevent duplicate widget rendering in the same container
      if (widgetIdRef.current) return;

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: effectiveSitekey,
          callback: (token: string) => {
            if (isMounted && onVerifyRef.current) {
              onVerifyRef.current(token);
            }
          },
          "expired-callback": () => {
            if (isMounted && onExpireRef.current) {
              onExpireRef.current();
            }
          },
          "error-callback": () => {
            if (isMounted && onErrorRef.current) {
              onErrorRef.current();
            }
          },
          theme,
          action: "turnstile-spin-v1",
        });
        widgetIdRef.current = id;
      } catch (e) {
        console.error("Turnstile render error:", e);
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      window.onloadTurnstileCallback = () => {
        if (isMounted) renderWidget();
      };

      const existingScript = document.getElementById("cf-turnstile-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "cf-turnstile-script";
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", renderWidget);
      }
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (err) {
          // Ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [effectiveSitekey, theme]);

  return (
    <div className="flex flex-col items-center justify-center my-2 min-h-[65px]">
      <div ref={containerRef} className="cf-turnstile" />
      {isPlaceholderKey && (
        <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-mono">
          ℹ️ Cloudflare Demo Key Active (Always Passes)
        </p>
      )}
    </div>
  );
}
