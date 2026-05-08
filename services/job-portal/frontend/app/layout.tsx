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
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <div className="pt-16 h-full min-h-screen bg-gray-50">
            {children}
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
