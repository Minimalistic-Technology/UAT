"use client"
import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
    const pathname = usePathname();
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  return (
    <html lang="en" className={inter.className}>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-muted">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold">404</h1>
            <p className="mb-4 text-xl text-muted-foreground">
              Oops! Page not found
            </p>
            <a
              href="/"
              className="text-primary underline hover:text-primary/90"
            >
              Return to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
