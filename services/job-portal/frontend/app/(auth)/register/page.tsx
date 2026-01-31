
import { Suspense } from 'react';
import RegisterClient from './registerClient';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <RegisterClient />
    </Suspense>
  );
}