'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import FormField from '@/components/FormField';
import { otpSchema } from '@/lib/validations';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { isAxiosError } from 'axios';

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useAuth();

  const email = params.get('email') || '';
  const purpose = (params.get('purpose') as 'signup' | 'login') || 'signup';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');

    const parsed = otpSchema.safeParse({ code });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid code');
      return;
    }

    setSubmitting(true);
    try {
      const { user } = await authApi.verifyOtp(email, parsed.data.code, purpose);
      setUser(user);
      router.push(user.usernameSet ? '/dashboard' : '/username');
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message || 'Verification failed' : 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError('');
    setInfo('');
    setResending(true);
    try {
      await authApi.resendOtp(email, purpose);
      setInfo('A new code has been sent.');
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message || 'Could not resend code' : 'Could not resend code');
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthCard title="Check your email" subtitle={email ? `We sent a 6-digit code to ${email}` : 'Enter your code'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Verification code" error={error}>
          <input
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-center text-lg tracking-[0.5em] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="------"
          />
        </FormField>

        {info ? <p className="text-sm text-green-600">{info}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? 'Verifying…' : 'Verify'}
        </button>
      </form>

      <button
        onClick={handleResend}
        disabled={resending}
        className="mt-4 w-full text-center text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
      >
        {resending ? 'Sending…' : "Didn't get a code? Resend"}
      </button>
    </AuthCard>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
