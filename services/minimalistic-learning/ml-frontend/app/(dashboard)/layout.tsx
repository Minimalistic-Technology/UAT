import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Minimalistic Learning | Elevate Your Knowledge",
    template: "%s | Minimalistic Learning"
  },
  description: "A premium blog platform for sharing minimal technology insights, learning experiences, and coding walkthroughs.",
  keywords: ["Learning", "Tech", "Walkthroughs", "Minimalism", "Development"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <div className="flex flex-col min-h-screen bg-transparent transition-colors duration-500 text-gray-900 dark:text-gray-100">
            {children}
          </div>
          <Footer />
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
