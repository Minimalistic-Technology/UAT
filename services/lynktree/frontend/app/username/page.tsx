'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import FormField from '@/components/FormField';
import { usernameSchema } from '@/lib/validations';
import { userApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { isAxiosError } from 'axios';

export default function UsernamePage() {
  const router = useRouter();
  const { user, setUser, loading } = useAuth();
  const [username, setUsernameValue] = useState('');
  const [error, setError] = useState('');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user?.usernameSet) router.push('/dashboard');
  }, [loading, user, router]);

  useEffect(() => {
    const parsed = usernameSchema.safeParse({ username });
    if (!parsed.success) {
      setAvailable(null);
      return;
    }
    setChecking(true);
    const timeout = setTimeout(() => {
      userApi
        .checkUsername(parsed.data.username)
        .then((res) => setAvailable(res.available))
        .catch(() => setAvailable(null))
        .finally(() => setChecking(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [username]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const parsed = usernameSchema.safeParse({ username });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid username');
      return;
    }
    if (available === false) {
      setError('This username is taken');
      return;
    }

    setSubmitting(true);
    try {
      const { user: updated } = await userApi.setUsername(parsed.data.username);
      setUser(updated);
      router.push('/dashboard');
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message || 'Could not set username' : 'Could not set username');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Pick your username" subtitle="This is your public page: lynktree.com/u/username">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Username" error={error}>
          <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
            <span className="pl-3 text-sm text-gray-400">u/</span>
            <input
              value={username}
              onChange={(e) => setUsernameValue(e.target.value.toLowerCase())}
              className="w-full rounded-lg px-2 py-2 text-sm focus:outline-none"
              placeholder="rajmane84"
            />
          </div>
          {!error && username ? (
            <p className={`text-sm ${checking ? 'text-gray-400' : available ? 'text-green-600' : 'text-red-600'}`}>
              {checking ? 'Checking…' : available ? 'Available' : available === false ? 'Already taken' : ''}
            </p>
          ) : null}
        </FormField>

        <button
          type="submit"
          disabled={submitting || available === false}
          className="mt-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </AuthCard>
  );
}
