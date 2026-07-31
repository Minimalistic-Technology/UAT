"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Suspense } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '';
    const { login } = useAuthStore();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // Lockout countdown (seconds)
    const [lockoutSeconds, setLockoutSeconds] = useState(0);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startLockoutTimer = (seconds: number) => {
        setLockoutSeconds(seconds);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setLockoutSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    setError('');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const onSubmit = async (data: LoginFormValues) => {
        if (lockoutSeconds > 0) return;
        if (!recaptchaToken) {
            setError('Please verify you are human');
            return;
        }

        setLoading(true);
        try {
            setError('');
            const payload = { ...data, recaptchaToken };
            const res = await api.post('/auth/login', payload);
            if (res.data.success) {
                toast.success(`Welcome back, ${res.data.user.name}! ✨`);
                login(res.data.user, res.data.token);
                if (redirectTo) {
                    router.push(redirectTo);
                } else {
                    router.push(res.data.user.role === 'Admin' ? '/admin/dashboard' : '/profile');
                }
            }
        } catch (err: any) {
            recaptchaRef.current?.reset();
            setRecaptchaToken(null);
            const errMsg: string = err.response?.data?.error || 'Failed to login. Please try again.';
            setError(errMsg);
            // If locked, extract minutes and start countdown
            if (err.response?.status === 429) {
                const match = errMsg.match(/(\d+)\s*minute/i);
                const mins = match ? parseInt(match[1]) : 2;
                startLockoutTimer(mins * 60);
            }
        } finally {
            setLoading(false);
        }
    };

    const isLocked = lockoutSeconds > 0;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold">Welcome back</h2>
                <p className="text-sm text-muted-foreground mt-1">Enter your credentials to access your account</p>
            </div>

            {error && !isLocked && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {isLocked && (
                <div className="mb-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-sm flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 font-medium">
                        <ShieldAlert size={18} />
                        Account Temporarily Locked
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                        Too many failed attempts. Please wait before trying again.
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <Clock size={16} className="text-orange-500" />
                        <span className="font-mono text-lg font-bold tracking-widest text-orange-600 dark:text-orange-400">
                            {formatTime(lockoutSeconds)}
                        </span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" placeholder="name@example.com" className="pl-9" disabled={isLocked} {...register('email')} />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="password" type="password" placeholder="••••••••" className="pl-9" disabled={isLocked} {...register('password')} />
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <div className="flex justify-center my-2">
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                        onChange={(token) => setRecaptchaToken(token)}
                    />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={loading || isLocked}>
                    {isLocked ? `Locked – wait ${formatTime(lockoutSeconds)}` : loading ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"} className="text-primary hover:underline font-medium">Sign up</Link>
            </div>
        </motion.div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="text-center py-10 text-sm text-muted-foreground">Loading login form...</div>}>
            <LoginForm />
        </Suspense>
    );
}
