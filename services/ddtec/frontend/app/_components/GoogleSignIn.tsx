"use client";

import React, { useEffect, useRef } from "react";

interface GoogleSignInProps {
  onCredential: (credential: string) => void;
  onError?: () => void;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  className?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            container: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: string | number;
              logo_alignment?: string;
            }
          ) => void;
        };
      };
    };
  }
}

export default function GoogleSignIn({
  onCredential,
  onError,
  text = "continue_with",
  className = ""
}: GoogleSignInProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const lastRenderedWidthRef = useRef<number>(0);

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  }, [onCredential, onError]);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isPlaceholderClientId = !clientId || clientId.includes("your-google-oauth-client-id") || clientId.trim() === "";

  useEffect(() => {
    if (isPlaceholderClientId) return;
    let isMounted = true;
    let resizeTimeout: NodeJS.Timeout | null = null;

    const renderGoogleButton = () => {
      if (!containerRef.current || !window.google || !isMounted) return;

      // Google Identity Services button width must be between 200px and 400px
      const availableWidth = wrapperRef.current ? wrapperRef.current.clientWidth : 0;
      const targetWidth = availableWidth > 0
        ? Math.min(400, Math.max(200, Math.floor(availableWidth)))
        : 320;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId as string,
          callback: (response) => {
            if (isMounted && response?.credential) {
              onCredentialRef.current(response.credential);
            } else if (isMounted && onErrorRef.current) {
              onErrorRef.current();
            }
          },
        });

        // Clear container before re-rendering to prevent duplicate iframes
        containerRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text,
          shape: "rectangular",
          width: targetWidth,
          logo_alignment: "left",
        });

        lastRenderedWidthRef.current = targetWidth;
      } catch (e) {
        console.error("Google Sign-In render error:", e);
      }
    };

    if (window.google) {
      renderGoogleButton();
    } else {
      const existingScript = document.getElementById("google-identity-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-identity-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (isMounted) renderGoogleButton();
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", () => {
          if (isMounted) renderGoogleButton();
        });
      }
    }

    // Dynamic resize observer: automatically resizes Google button to match container on mobile orientation or resize
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && wrapperRef.current) {
      observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const currentWidth = Math.floor(entry.contentRect.width);
          if (currentWidth > 0) {
            const nextTarget = Math.min(400, Math.max(200, currentWidth));
            if (Math.abs(nextTarget - lastRenderedWidthRef.current) > 10) {
              if (resizeTimeout) clearTimeout(resizeTimeout);
              resizeTimeout = setTimeout(() => {
                if (isMounted) renderGoogleButton();
              }, 150);
            }
          }
        }
      });
      observer.observe(wrapperRef.current);
    }

    return () => {
      isMounted = false;
      if (resizeTimeout) clearTimeout(resizeTimeout);
      if (observer) observer.disconnect();
    };
  }, [clientId, isPlaceholderClientId, text]);

  if (isPlaceholderClientId) {
    return (
      <p className="text-[11px] text-slate-400 text-center font-mono">
        Google Sign-In not configured (set NEXT_PUBLIC_GOOGLE_CLIENT_ID)
      </p>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={`w-full max-w-full flex justify-center items-center py-1.5 overflow-hidden min-h-[44px] ${className}`}
    >
      <div
        ref={containerRef}
        className="w-full flex justify-center items-center max-w-full overflow-hidden [&>div]:max-w-full [&_iframe]:max-w-full"
      />
    </div>
  );
}
