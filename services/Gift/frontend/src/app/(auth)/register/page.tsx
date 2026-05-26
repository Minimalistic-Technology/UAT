"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, User, AlertCircle, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState("");
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema)
    });

    const onRegisterSubmit = async (data: RegisterFormValues) => {
        setLoading(true);
        try {
            setError('');
            const res = await api.post('/auth/register', data);
            if (res.data.success) {
                toast.success('OTP sent to your email!');
                setEmail(data.email);
                setStep(2);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) return setError('Please enter a 6-digit OTP');

        setLoading(true);
        try {
            setError('');
            const res = await api.post('/auth/verify-otp', { email, otp });
            if (res.data.success) {
                toast.success(`Welcome ${res.data.user.name}! 🚀`);
                login(res.data.user, res.data.token);
                router.push(res.data.user.role === 'Admin' ? '/admin/dashboard' : '/profile');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold">{step === 1 ? 'Create an account' : 'Verify Email'}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {step === 1 ? 'Sign up to get started with SmartShare' : `Enter the 6-digit OTP sent to ${email}`}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="name" placeholder="John Doe" className="pl-9" {...register('name')} />
                            </div>
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="email" placeholder="name@example.com" className="pl-9" {...register('email')} />
                            </div>
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register('password')} />
                            </div>
                            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                        </div>

                        <Button type="submit" className="w-full mt-2" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Create Account'}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={onOtpSubmit} className="space-y-6">
                        <div className="flex justify-center my-4">
                            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        <Button type="submit" className="w-full gap-2" disabled={loading || otp.length !== 6}>
                            <KeyRound className="w-4 h-4" />
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </Button>
                    </form>
                )}

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
