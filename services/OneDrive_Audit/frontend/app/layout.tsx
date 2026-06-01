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
            <header className="px-6 py-4 border-b border-soft-border bg-soft-surface soft-shadow z-10 sticky top-0 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-soft-heading tracking-tight flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m8 17 4 4 4-4" /></svg>
                </div>
                OneDrive Audit
              </h1>
              <div className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white soft-shadow" />
            </header>
            <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
