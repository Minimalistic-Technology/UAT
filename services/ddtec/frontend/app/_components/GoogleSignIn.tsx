"use client";

import React, { useEffect, useRef } from "react";

interface GoogleSignInProps {
  onCredential: (credential: string) => void;
  onError?: () => void;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
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
            }
          ) => void;
        };
      };
    };
  }
}

export default function GoogleSignIn({ onCredential, onError, text = "continue_with" }: GoogleSignInProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  }, [onCredential, onError]);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isPlaceholderClientId = !clientId || clientId.includes("your-google-oauth-client-id") || clientId.trim() === "";

  useEffect(() => {
    if (isPlaceholderClientId) return;
    let isMounted = true;

    const renderButton = () => {
      if (!containerRef.current || !window.google || !isMounted) return;

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
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text,
          shape: "pill",
          width: 350,
        });
      } catch (e) {
        console.error("Google Sign-In render error:", e);
      }
    };

    if (window.google) {
      renderButton();
    } else {
      const existingScript = document.getElementById("google-identity-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-identity-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = renderButton;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", renderButton);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [clientId, isPlaceholderClientId, text]);

  if (isPlaceholderClientId) {
    return (
      <p className="text-[11px] text-slate-400 text-center font-mono">
        Google Sign-In not configured (set NEXT_PUBLIC_GOOGLE_CLIENT_ID)
      </p>
    );
  }

  return <div ref={containerRef} className="flex justify-center" />;
}
