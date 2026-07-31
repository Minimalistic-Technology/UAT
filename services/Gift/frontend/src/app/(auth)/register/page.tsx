"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, User, AlertCircle, KeyRound, Clock, ShieldAlert, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Suspense } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
type RegisterFormValues = z.infer<typeof registerSchema>;

const OTP_VALID_SECONDS = 120; // 2 minutes matching backend

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '';
    const { login } = useAuthStore();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState("");
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    // OTP expiry countdown (down from 120s)
    const [otpSeconds, setOtpSeconds] = useState(0);
    const [lockoutSeconds, setLockoutSeconds] = useState(0);

    const otpTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema)
    });

    useEffect(() => {
        return () => {
            if (otpTimerRef.current) clearInterval(otpTimerRef.current);
            if (lockTimerRef.current) clearInterval(lockTimerRef.current);
        };
    }, []);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const startOtpTimer = (seconds: number = OTP_VALID_SECONDS) => {
        if (otpTimerRef.current) clearInterval(otpTimerRef.current);
        setOtpSeconds(seconds);
        otpTimerRef.current = setInterval(() => {
            setOtpSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(otpTimerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startLockoutTimer = (seconds: number) => {
        if (lockTimerRef.current) clearInterval(lockTimerRef.current);
        setLockoutSeconds(seconds);
        lockTimerRef.current = setInterval(() => {
            setLockoutSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(lockTimerRef.current!);
                    setError('');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const onRegisterSubmit = async (data: RegisterFormValues) => {
        if (!recaptchaToken) {
            setError('Please verify you are human');
            return;
        }
        setLoading(true);
        try {
            setError('');
            const payload = { ...data, recaptchaToken };
            const res = await api.post('/auth/register', payload);
            if (res.data.success) {
                toast.success('OTP sent to your email!');
                setEmail(data.email);
                setStep(2);
                startOtpTimer();
            }
        } catch (err: any) {
            recaptchaRef.current?.reset();
            setRecaptchaToken(null);
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) return setError('Please enter a 6-digit OTP');
        if (lockoutSeconds > 0) return;

        setLoading(true);
        try {
            setError('');
            const res = await api.post('/auth/verify-otp', { email, otp });
            if (res.data.success) {
                if (otpTimerRef.current) clearInterval(otpTimerRef.current);
                toast.success(`Welcome ${res.data.user.name}! 🚀`);
                login(res.data.user, res.data.token);
                if (redirectTo) {
                    router.push(redirectTo);
                } else {
                    router.push(res.data.user.role === 'Admin' ? '/admin/dashboard' : '/profile');
                }
            }
        } catch (err: any) {
            const errMsg: string = err.response?.data?.error || 'Invalid OTP. Please try again.';
            setError(errMsg);
            if (err.response?.status === 429) {
                const match = errMsg.match(/(\d+)\s*minute/i);
                const mins = match ? parseInt(match[1]) : 2;
                startLockoutTimer(mins * 60);
            }
        } finally {
            setLoading(false);
        }
    };

    const onResendOtp = async () => {
        if (lockoutSeconds > 0) return;
        setResendLoading(true);
        try {
            setError('');
            const res = await api.post('/auth/resend-otp', { email });
            if (res.data.success) {
                toast.success('New OTP sent to your email!');
                setOtp('');
                startOtpTimer();
            }
        } catch (err: any) {
            const errMsg: string = err.response?.data?.error || 'Failed to resend OTP.';
            setError(errMsg);
            if (err.response?.status === 429) {
                const match = errMsg.match(/(\d+)\s*minute/i);
                const mins = match ? parseInt(match[1]) : 2;
                startLockoutTimer(mins * 60);
            }
        } finally {
            setResendLoading(false);
        }
    };

    const isOtpExpired = step === 2 && otpSeconds === 0 && lockoutSeconds === 0;
    const isLocked = lockoutSeconds > 0;

    return (
        <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold">{step === 1 ? 'Create an account' : 'Verify Email'}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {step === 1 ? 'Sign up to get started with SmartShare' : `Enter the 6-digit OTP sent to ${email}`}
                    </p>
                </div>

                {/* Error Message */}
                {error && !isLocked && (
                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Lockout Banner */}
                {isLocked && (
                    <div className="mb-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-sm flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 font-medium">
                            <ShieldAlert size={18} />
                            OTP Verification Locked
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                            Too many failed attempts. Try again after the timer expires.
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <Clock size={16} className="text-orange-500" />
                            <span className="font-mono text-lg font-bold tracking-widest text-orange-600 dark:text-orange-400">
                                {formatTime(lockoutSeconds)}
                            </span>
                        </div>
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

                        <div className="flex justify-center my-2">
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                                onChange={(token) => setRecaptchaToken(token)}
                            />
                        </div>

                        <Button type="submit" className="w-full mt-2" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Create Account'}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={onOtpSubmit} className="space-y-4">
                        {/* OTP Expiry Timer */}
                        {!isLocked && (
                            <div className={`flex items-center justify-center gap-2 text-sm font-medium ${otpSeconds > 0 ? 'text-muted-foreground' : 'text-destructive'}`}>
                                <Clock size={14} className={otpSeconds > 0 ? 'text-primary' : 'text-destructive'} />
                                {otpSeconds > 0
                                    ? <span>OTP expires in <span className="font-mono font-bold">{formatTime(otpSeconds)}</span></span>
                                    : <span>OTP expired — please resend</span>
                                }
                            </div>
                        )}

                        <div className="flex justify-center my-2">
                            <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={isLocked || isOtpExpired}>
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

                        <Button type="submit" className="w-full gap-2" disabled={loading || otp.length !== 6 || isLocked || isOtpExpired}>
                            <KeyRound className="w-4 h-4" />
                            {isLocked ? `Locked – wait ${formatTime(lockoutSeconds)}` : loading ? 'Verifying...' : 'Verify Email'}
                        </Button>

                        {/* Resend OTP Button */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={onResendOtp}
                                disabled={resendLoading || isLocked || lockoutSeconds > 0}
                                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                            >
                                <RefreshCw size={12} className={resendLoading ? 'animate-spin' : ''} />
                                {resendLoading ? 'Sending...' : 'Resend OTP'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"} className="text-primary hover:underline font-medium">Log in</Link>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="text-center py-10 text-sm text-muted-foreground">Loading registration form...</div>}>
            <RegisterForm />
        </Suspense>
    );
}
