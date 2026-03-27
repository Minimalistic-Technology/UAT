import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import { Providers } from "./Providers";
import { cn } from "./lib/utils";
import NextTopLoader from 'nextjs-toploader';
import OfflineNotification from "./components/OfflineNavigator";
import { AuthProvider } from "./context/AuthContext";


export const metadata: Metadata = {
  title: "Minimalistic Learning",
  description:
    "Minimalistic Learning is an innovative education platform offering clean, distraction-free learning experiences. Focus on what matters most — understanding, clarity, and progress through modern digital tools.",
  keywords: [
    "Minimalistic Learning",
    "online learning",
    "edtech platform",
    "clean UI learning",
    "minimalist education",
    "digital classroom",
    "interactive learning",
    "self-paced courses",
    "e-learning solutions",
    "accessible education",
    "Next.js learning platform",
    "modern education tools",
    "custom learning solutions",
    "tech-based education",
    "responsive LMS",
    "student-friendly UI",
    "Framer Motion UI",
    "React education tools",
    "progressive learning apps",
    "TypeScript platform",
    "education design",
    "personalized learning",
    "no-distraction study",
    "learning through minimalism",
    "skill-based learning",
    "adaptive learning tech",
  ],
  authors: [
    {
      name: "Minimalistic Learning",
      url: "https://www.minimalisticlearning.com/",
    },
  ],
  creator: "Minimalistic Learning",
  metadataBase: new URL("https://www.minimalisticlearning.com"),
  openGraph: {
    title: "Minimalistic Learning",
    description:
      "Experience education redefined — focus, clarity, and minimalism in one intuitive learning platform.",
    url: "https://www.minimalisticlearning.com",
    siteName: "Minimalistic Learning",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Minimalistic Learning",
    description:
      "Minimalistic Learning is a modern education platform built for clarity, focus, and effective digital learning.",
    creator: "@TechMinimalists",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#daf0ff",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-white dark:bg-slate-950',
          'antialiased',
          // Prevent content shift
          '[&_.theme-toggle-wrapper]:opacity-0 [&_.theme-toggle-wrapper]:animate-fade-in'
        )}
      >
        <NextTopLoader showSpinner={false} />
        <AuthProvider>
          <Providers>
            <Navbar />
            <OfflineNotification />
            <main>{children}</main>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
