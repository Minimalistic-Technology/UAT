'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCard from '@/components/AuthCard';
import FormField from '@/components/FormField';
import PasswordInput from '@/components/PasswordInput';
import { signupSchema } from '@/lib/validations';
import { authApi } from '@/lib/api';
import { useGuestOnly } from '@/lib/use-guest-only';
import { isAxiosError } from 'axios';

export default function SignupPage() {
  const router = useRouter();
  const { checkingSession } = useGuestOnly();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setErrors({});

    const parsed = signupSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await authApi.signup(parsed.data.email, parsed.data.password);
      router.push(`/verify?email=${encodeURIComponent(parsed.data.email)}&purpose=signup`);
    } catch (err) {
      setFormError(isAxiosError(err) ? err.response?.data?.message || 'Signup failed' : 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading…</div>
    );
  }

  return (
    <AuthCard title="Create your account" subtitle="Just an email and password to get started.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Email" error={errors.email}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="you@example.com"
          />
        </FormField>
        <FormField label="Password" error={errors.password}>
          <PasswordInput value={password} onChange={setPassword} placeholder="At least 8 characters" />
        </FormField>

        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
