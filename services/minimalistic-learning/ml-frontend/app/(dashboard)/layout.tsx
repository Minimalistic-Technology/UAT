import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      <body className="flex flex-col min-h-screen bg-background text-foreground" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="flex flex-col flex-1 pt-16 transition-colors duration-500">
            {children}
          </main>
          <Footer />
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
