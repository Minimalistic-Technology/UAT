
import { Suspense } from 'react';
import RegisterEmployerClient from './register-employer-client';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <RegisterEmployerClient />
    </Suspense>
  );
}