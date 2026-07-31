import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Minimalistic Learning | Elevate Your Knowledge",
    template: "%s | Minimalistic Learning",
  },
  description:
    "A premium blog platform for sharing minimal technology insights, learning experiences, and coding walkthroughs.",
  keywords: ["Learning", "Tech", "Walkthroughs", "Minimalism", "Development"],
};

import Providers from "./providers";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="bg-background text-foreground flex min-h-screen flex-col">
            {children}
          </div>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
