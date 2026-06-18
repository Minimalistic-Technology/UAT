import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import { APP_NAME } from "@/constants";
import { AiChatbot } from "@/features/admin/components/ai-chatbot";
import MainWrapper from "@/components/main-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - Find Your Dream Job`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Connect with top employers and find your perfect career opportunity. Discover jobs, internships, and build your professional profile.",
  keywords: [
    "Job Portal",
    "Careers",
    "Employment",
    "Internships",
    "Recruitment",
    "Hiring",
    "Job Search",
    "Resume",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: `${APP_NAME} - Find Your Dream Job`,
    description:
      "Connect with top employers and find your perfect career opportunity. Discover jobs, internships, and build your professional profile.",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - Find Your Dream Job`,
    description:
      "Connect with top employers and find your perfect career opportunity.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakartaSans.variable}`}
    >
      <body className="bg-background text-foreground font-sans transition-colors duration-300">
        <Providers>
          <Navbar />
          <MainWrapper>{children}</MainWrapper>
          <Toaster position="top-right" />
          <AiChatbot />
        </Providers>
      </body>
    </html>
  );
}
