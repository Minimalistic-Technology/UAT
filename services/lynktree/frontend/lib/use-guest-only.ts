'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

/**
 * Redirects an already-authenticated user away from guest-only pages
 * (login, signup) to their dashboard.
 */
export function useGuestOnly() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    router.replace(user.usernameSet ? '/dashboard' : '/username');
  }, [loading, user, router]);

  return { checkingSession: loading || !!user };
}
