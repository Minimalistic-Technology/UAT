import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import { APP_NAME } from "@/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${APP_NAME} - Find Your Dream Job`,
  description:
    "Connect with top employers and find your perfect career opportunity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + " bg-white dark:bg-[#09090b] text-slate-900 dark:text-slate-100 transition-colors duration-300"}>
        <Providers>
          <Navbar />
          <div className="pt-16 h-full min-h-screen bg-gray-50 dark:bg-[#09090b] transition-colors duration-300">
            {children}
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
