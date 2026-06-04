import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '../components/providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OneDrive Audit & Export Tool',
  description: 'Enterprise-grade OneDrive file audit, classification, and export tool.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen font-sans`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen bg-soft-bg text-soft-text">
            <main className="flex-1 w-full mx-auto relative">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
