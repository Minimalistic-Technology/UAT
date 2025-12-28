import { Suspense } from 'react';
import { VerifyForm } from './verify-form';

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}