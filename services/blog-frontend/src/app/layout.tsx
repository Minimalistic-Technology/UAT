import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest articles',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="site-header__inner">
            <Link href="/" className="brand">
              <span className="brand__mark" aria-hidden />
              DDTEC Blog
            </Link>
            <nav className="site-nav">
              <Link href="/">Articles</Link>
              <a href="https://ddtec.in" target="_blank" rel="noreferrer">
                ddtec.in
              </a>
            </nav>
          </div>
        </header>
        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
