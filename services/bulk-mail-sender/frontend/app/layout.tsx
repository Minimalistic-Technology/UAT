import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Email Scheduler - Manage Your Email Campaigns',
  description: 'Professional email scheduling and campaign management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 `}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}