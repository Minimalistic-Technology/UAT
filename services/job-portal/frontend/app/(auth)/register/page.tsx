'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { authService } from '@/app/lib/services/auth.service';
import { toast } from 'sonner';
import { UserRole } from '@/app/types';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum([UserRole.JOB_SEEKER, UserRole.EMPLOYER]),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const defaultRole = (roleParam === UserRole.EMPLOYER ? UserRole.EMPLOYER : UserRole.JOB_SEEKER);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: defaultRole,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Join our platform today</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit) as any} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer ${selectedRole === UserRole.JOB_SEEKER ? 'ring-2 ring-primary-600' : ''}`}>
                  <input
                    type="radio"
                    {...register('role')}
                    value={UserRole.JOB_SEEKER}
                    className="sr-only"
                  />
                  <div className="border-2 border-gray-300 rounded-lg p-4 text-center hover:border-primary-600 transition-colors">
                    <p className="font-medium">Job Seeker</p>
                    <p className="text-xs text-gray-500">Looking for jobs</p>
                  </div>
                </label>
                <label className={`cursor-pointer ${selectedRole === UserRole.EMPLOYER ? 'ring-2 ring-primary-600' : ''}`}>
                  <input
                    type="radio"
                    {...register('role')}
                    value={UserRole.EMPLOYER}
                    className="sr-only"
                  />
                  <div className="border-2 border-gray-300 rounded-lg p-4 text-center hover:border-primary-600 transition-colors">
                    <p className="font-medium">Employer</p>
                    <p className="text-xs text-gray-500">Hiring talent</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('firstName')}
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
                disabled={isLoading}
              />
              <Input
                {...register('lastName')}
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                disabled={isLoading}
              />
            </div>

            <Input
              {...register('email')}
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              error={errors.email?.message}
              disabled={isLoading}
            />

            <Input
              {...register('phone')}
              type="tel"
              label="Phone Number (Optional)"
              placeholder="+1234567890"
              error={errors.phone?.message}
              disabled={isLoading}
            />

            <Input
              {...register('password')}
              type="password"
              label="Password"
              placeholder="••••••••"
              error={errors.password?.message}
              disabled={isLoading}
            />

            <Input
              {...register('confirmPassword')}
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              disabled={isLoading}
            />

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}