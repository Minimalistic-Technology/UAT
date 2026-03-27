"use client";
import { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
// import { SessionProvider } from 'next-auth/react';
import { RecoilRoot } from "recoil";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <RecoilRoot>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#333',
                  border: '1px solid #e5e7eb',
                },
                success: {
                  iconTheme: {
                    primary: '#3b82f6',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            {children}
          </RecoilRoot>
        </ThemeProvider>
      </SessionProvider>
    </>
  );
};
