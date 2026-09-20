'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-6">
        <span className="text-xl font-bold text-brand-700">Lynktree</span>
        <nav className="flex items-center gap-3">
          {!loading && user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Sign up free
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="max-w-3xl mx-auto text-center px-6 py-24">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          One link for everything you create
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Share your links, files, and PDFs from a single, beautiful page — yourlynktree.com/u/username
        </p>
        <div className="mt-8">
          <Link
            href="/signup"
            className="inline-block rounded-full bg-brand-600 px-8 py-3 text-base font-medium text-white hover:bg-brand-700"
          >
            Claim your Lynktree
          </Link>
        </div>
      </section>
    </main>
  );
}
