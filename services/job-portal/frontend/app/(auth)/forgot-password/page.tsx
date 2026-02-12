'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/app/lib/api';
import Link from 'next/link';

const emailSchema = z.object({
    email: z.string().email('Invalid email address'),
});

const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

const resetSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const { register: registerEmail, handleSubmit: handleSubmitEmail, formState: { errors: emailErrors } } = useForm({
        resolver: zodResolver(emailSchema)
    });

    const { register: registerOtp, handleSubmit: handleSubmitOtp, formState: { errors: otpErrors } } = useForm({
        resolver: zodResolver(otpSchema)
    });

    const { register: registerReset, handleSubmit: handleSubmitReset, formState: { errors: resetErrors } } = useForm({
        resolver: zodResolver(resetSchema)
    });

    const onEmailSubmit = async (data: any) => {
        setLoading(true);
        try {
            await apiClient.post('/auth/forgot-password', { email: data.email });
            setEmail(data.email);
            setStep(2);
            toast.success('OTP sent to your email');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const onOtpSubmit = async (data: any) => {
        setLoading(true);
        try {
            await apiClient.post('/auth/verify-reset-otp', { email, otp: data.otp });
            setOtp(data.otp);
            setStep(3);
            toast.success('OTP verified');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const onResetSubmit = async (data: any) => {
        setLoading(true);
        try {
            await apiClient.post('/auth/reset-password', {
                email,
                otp,
                password: data.password
            });
            toast.success('Password reset successfully');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}
                    </h2>
                    <p className="mt-2 text-gray-600">
                        {step === 1
                            ? 'Enter your email to receive an OTP'
                            : step === 2
                                ? `Enter the OTP sent to ${email}`
                                : 'Enter your new password'}
                    </p>
                </div>

                <Card>
                    {step === 1 && (
                        <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="space-y-6">
                            <Input
                                {...registerEmail('email')}
                                label="Email Address"
                                type="email"
                                error={emailErrors.email?.message as string}
                                disabled={loading}
                            />
                            <Button type="submit" className="w-full" loading={loading}>
                                Send OTP
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmitOtp(onOtpSubmit)} className="space-y-6">
                            <Input
                                {...registerOtp('otp')}
                                label="OTP"
                                placeholder="123456"
                                maxLength={6}
                                error={otpErrors.otp?.message as string}
                                disabled={loading}
                            />
                            <Button type="submit" className="w-full" loading={loading}>
                                Verify OTP
                            </Button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-6">
                            <Input
                                {...registerReset('password')}
                                label="New Password"
                                type="password"
                                error={resetErrors.password?.message as string}
                                disabled={loading}
                            />
                            <Input
                                {...registerReset('confirmPassword')}
                                label="Confirm New Password"
                                type="password"
                                error={resetErrors.confirmPassword?.message as string}
                                disabled={loading}
                            />
                            <Button type="submit" className="w-full" loading={loading}>
                                Reset Password
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                            Back to Login
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
